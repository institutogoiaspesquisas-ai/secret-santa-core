-- Enum para roles no grupo
CREATE TYPE public.group_role AS ENUM ('owner', 'member');

-- Enum para status de membros
CREATE TYPE public.member_status AS ENUM ('pending', 'approved', 'rejected');

-- Tabela de grupos
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de membros do grupo
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.group_role DEFAULT 'member',
  status public.member_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Tabela de perfis
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',
  audio_url TEXT,
  transcript TEXT,
  is_complete BOOLEAN DEFAULT false,
  validation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Tabela de perfis de usuário (informações básicas)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário é membro aprovado do grupo
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = _user_id
    AND group_id = _group_id
    AND status = 'approved'
  )
$$;

-- Função para verificar se usuário é owner do grupo
CREATE OR REPLACE FUNCTION public.is_group_owner(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = _group_id
    AND owner_id = _user_id
  )
$$;

-- RLS Policies para groups
CREATE POLICY "Users can view groups they own or are members of"
  ON public.groups FOR SELECT
  USING (
    owner_id = auth.uid() OR
    public.is_group_member(auth.uid(), id)
  );

CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their groups"
  ON public.groups FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their groups"
  ON public.groups FOR DELETE
  USING (owner_id = auth.uid());

-- RLS Policies para group_members
CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    public.is_group_owner(auth.uid(), group_id) OR
    public.is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Users can request to join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage group members"
  ON public.group_members FOR UPDATE
  USING (public.is_group_owner(auth.uid(), group_id));

CREATE POLICY "Users can leave groups or owners can remove members"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    public.is_group_owner(auth.uid(), group_id)
  );

-- RLS Policies para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Group members can view complete profiles in their group"
  ON public.profiles FOR SELECT
  USING (
    is_complete = true AND
    public.is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies para user_profiles
CREATE POLICY "Users can view all user profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own user profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own user profile"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Trigger para criar user_profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_members_updated_at
  BEFORE UPDATE ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para áudios de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-audios', 'profile-audios', true);

-- Políticas de storage para profile-audios
CREATE POLICY "Users can upload their own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-audios' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-audios');

CREATE POLICY "Users can update their own audio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-audios' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-audios' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );