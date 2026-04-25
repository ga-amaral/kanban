-- AUTO-KANBAN CRM SCHEMA
-- Autor: Gabriel Amaral
-- Data: 27/01/2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de API tokens para acesso programático
CREATE TABLE public.api_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.workspaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.columns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline_date TIMESTAMP WITH TIME ZONE,
    title TEXT,
    description TEXT,
    urgency_level TEXT DEFAULT 'LOW',
    custom_data_jsonb JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.automations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    trigger_config JSONB NOT NULL,
    action_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE POLICY "Users can view their own profiles" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can manage their own api_tokens" ON public.api_tokens FOR ALL USING (
    auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Users can manage their own workspaces" ON public.workspaces FOR ALL USING (
    auth.uid() = owner_id OR public.is_admin()
);

CREATE POLICY "Users can manage columns in their workspaces" ON public.columns FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid() OR public.is_admin())
);

CREATE POLICY "Users can manage cards in their workspaces" ON public.cards FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid() OR public.is_admin())
);

CREATE POLICY "Users can manage automations in their workspaces" ON public.automations FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid() OR public.is_admin())
);

-- Function para validar API token e retornar user_id
CREATE OR REPLACE FUNCTION public.get_user_by_api_token(p_token_hash TEXT)
RETURNS UUID AS $$
DECLARE
    result_uuid UUID;
BEGIN
    SELECT user_id INTO result_uuid
    FROM public.api_tokens
    WHERE token_hash = p_token_hash
      AND revoked_at IS NULL;

    RETURN result_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function para atualizar last_used_at do token
CREATE OR REPLACE FUNCTION public.touch_api_token(p_token_hash TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.api_tokens
    SET last_used_at = NOW()
    WHERE token_hash = p_token_hash
      AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
