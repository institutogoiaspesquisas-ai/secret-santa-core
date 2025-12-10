import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HINT_PROMPT = `Você é uma IA criativa especializada em escrever dicas enigmáticas para um jogo de Amigo Oculto.

Receberá um JSON com informações de uma pessoa, contendo:
- tres_palavras (três palavras que definem a pessoa)
- hobbies (hobbies ou paixões)
- tipo_presente (tipo de presente que gosta)
- algo_ninguem_imagina (algo que ninguém imagina sobre ela)
- frase_costuma_dizer (uma frase que costuma dizer)
- estilo_vida (estilo de vida)
- personagem_seria (personagem que seria)
- comida_representa (comida que a representa)

Seu objetivo é gerar exatamente 3 dicas no formato JSON:
{
  "dica1": "texto",
  "dica2": "texto",
  "dica3": "texto"
}

**Regras:**
- Dica 1 (poética): simbolismo leve, introspectivo, com toque de mistério.
- Dica 2 (pessoal): hábitos e preferências disfarçados de metáforas.
- Dica 3 (divertida): curiosidade ou ironia com humor sutil.
- Nunca use o nome da pessoa, apelidos ou referências diretas.
- Todas as dicas devem soar como se fossem escritas por um narrador enigmático e espirituoso.
- Responda SOMENTE com o JSON, sem comentários extras.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId, userId, groupId, answers } = await req.json();
    
    console.log('Generating hints for profile:', profileId);
    console.log('Answers received:', JSON.stringify(answers));

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not configured');
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Chamar OpenAI para gerar as dicas
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: HINT_PROMPT },
          { role: 'user', content: JSON.stringify(answers) }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('OpenAI response:', content);
    
    const hintsJson = JSON.parse(content);
    console.log('Hints parsed successfully:', hintsJson);

    // Salvar no banco usando service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert hints (inserir ou atualizar se já existir)
    const { error: hintsError } = await supabase
      .from('hints')
      .upsert({
        group_id: groupId,
        user_id: userId,
        hint1: hintsJson.dica1,
        hint2: hintsJson.dica2,
        hint3: hintsJson.dica3,
        is_visible: false,
        generated_at: new Date().toISOString(),
      }, { 
        onConflict: 'group_id,user_id' 
      });

    if (hintsError) {
      console.error('Error saving hints:', hintsError);
      throw hintsError;
    }

    console.log('Hints saved to database');

    // Atualizar flag hints_generated no profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ hints_generated: true })
      .eq('id', profileId);

    if (profileError) {
      console.error('Error updating profile hints_generated:', profileError);
    } else {
      console.log('Profile hints_generated flag updated');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Dicas geradas com sucesso!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating hints:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
