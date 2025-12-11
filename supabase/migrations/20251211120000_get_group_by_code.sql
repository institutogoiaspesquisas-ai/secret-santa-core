-- Função para buscar grupo pelo código (bypass RLS)
CREATE OR REPLACE FUNCTION public.get_group_by_code(code_input TEXT) RETURNS TABLE (id UUID, name TEXT, owner_id UUID) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN RETURN QUERY
SELECT g.id,
    g.name,
    g.owner_id
FROM public.groups g
WHERE g.code = UPPER(code_input);
END;
$$;