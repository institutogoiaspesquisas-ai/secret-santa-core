import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { type, count } = await req.json();

        // Validar parâmetros
        if (!type || !["success", "fail"].includes(type)) {
            return new Response(
                JSON.stringify({ success: false, error: "Tipo inválido. Use 'success' ou 'fail'." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        const requestedCount = Math.min(Math.max(count || 5, 1), 20); // Entre 1 e 20

        // Buscar frases existentes para evitar duplicatas
        const { data: existingReactions, error: fetchError } = await supabase
            .from("reactions")
            .select("text")
            .eq("type", type);

        if (fetchError) {
            throw new Error(`Erro ao buscar frases existentes: ${fetchError.message}`);
        }

        const existingTexts = existingReactions?.map(r => r.text) || [];

        // Prompt para a IA
        const typeDescription = type === "success"
            ? "acerto (vitória, humor leve, celebração)"
            : "erro (engraçado, provocativo, leve zoeira)";

        const prompt = `Você é uma IA criativa e espirituosa que escreve frases curtas, humanas e engraçadas para um jogo de amigo oculto.

Você deve gerar ${requestedCount} frases novas do tipo "${type}" (${typeDescription}), SEM repetir frases anteriores.

Regras de tom:
- Nada de piadas "nerds" ou muito técnicas.
- Pode usar sarcasmo leve, ironia, referências a filmes famosos ou frases de pessoas conhecidas.
- Seja espontânea e coloquial, como se fosse uma pessoa espirituosa falando com amigos.
- Frases devem ter entre 6 e 20 palavras.
- Nunca usar nomes dos jogadores.
- Escreva em português brasileiro.

Frases existentes que você NÃO PODE repetir ou parafrasear:
${existingTexts.slice(0, 50).map(t => `- "${t}"`).join("\n")}

Responda APENAS com um JSON válido no formato:
{
  "frases": ["texto 1", "texto 2", ...]
}`;

        // Chamar OpenAI
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Você é um escritor criativo de frases curtas e engraçadas para jogos. Responda apenas em JSON válido."
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.9,
                max_tokens: 1000,
            }),
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.text();
            throw new Error(`OpenAI API error: ${errorData}`);
        }

        const openaiData = await openaiResponse.json();
        const content = openaiData.choices[0]?.message?.content;

        if (!content) {
            throw new Error("Resposta vazia da OpenAI");
        }

        // Parse do JSON
        let parsedResponse;
        try {
            // Limpar possíveis caracteres extras
            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
            parsedResponse = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error("Erro ao parsear resposta:", content);
            throw new Error("Resposta da IA não é um JSON válido");
        }

        const newPhrases = parsedResponse.frases || [];

        if (newPhrases.length === 0) {
            return new Response(
                JSON.stringify({ success: true, count: 0, message: "Nenhuma frase nova gerada." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Filtrar duplicatas
        const uniquePhrases = newPhrases.filter(
            (phrase: string) => !existingTexts.includes(phrase)
        );

        if (uniquePhrases.length === 0) {
            return new Response(
                JSON.stringify({ success: true, count: 0, message: "Todas as frases geradas já existiam." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Inserir novas frases
        const insertData = uniquePhrases.map((text: string) => ({
            type,
            text,
            is_default: false,
        }));

        const { data: insertedData, error: insertError } = await supabase
            .from("reactions")
            .insert(insertData)
            .select();

        if (insertError) {
            // Se houver conflito de unicidade, tentar inserir uma por uma
            if (insertError.code === "23505") {
                let insertedCount = 0;
                for (const item of insertData) {
                    const { error } = await supabase.from("reactions").insert(item);
                    if (!error) insertedCount++;
                }
                return new Response(
                    JSON.stringify({
                        success: true,
                        count: insertedCount,
                        message: `${insertedCount} frases novas adicionadas (algumas já existiam).`,
                    }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
            throw new Error(`Erro ao inserir frases: ${insertError.message}`);
        }

        return new Response(
            JSON.stringify({
                success: true,
                count: insertedData?.length || uniquePhrases.length,
                message: `${insertedData?.length || uniquePhrases.length} frases de ${type === "success" ? "sucesso" : "erro"} adicionadas!`,
                phrases: insertedData,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
