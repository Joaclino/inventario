-- ========================================================
-- INVENTÁRIO GERAL DE BENS E ATIVOS — SCHEME POSTGRESQL / SUPABASE
-- ========================================================

-- Habilitar a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    responsible_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIAS DE BENS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'box',
    is_custom BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SUBCATEGORIAS DE BENS
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_subcategory_per_category UNIQUE (category_id, name)
);

-- 4. LOCALIZAÇÕES (EDIFÍCIOS, PISOS, SALAS)
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building VARCHAR(255) NOT NULL,
    floor VARCHAR(100),
    room VARCHAR(255) NOT NULL,
    full_name VARCHAR(500) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ESTADOS DE CONSERVAÇÃO (PERSONALIZÁVEIS)
CREATE TABLE IF NOT EXISTS public.asset_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(50) DEFAULT 'gray',
    is_custom BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. INVENTÁRIOS POR DEPARTAMENTO
CREATE TABLE IF NOT EXISTS public.inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'validated')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    responsible_name VARCHAR(255) NOT NULL,
    general_notes TEXT,
    responsible_signature TEXT,
    admin_validation_signature TEXT,
    validated_by VARCHAR(255),
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. BENS E ATIVOS
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventories(id) ON DELETE SET NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    internal_id VARCHAR(100),
    asset_code VARCHAR(100) NOT NULL UNIQUE, -- Ex: ORG-000001 ou ORG-COZ-0001
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    category_name VARCHAR(255),
    subcategory_name VARCHAR(255),
    description TEXT NOT NULL,
    brand VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    existing_id VARCHAR(255),
    is_quantity_controlled BOOLEAN DEFAULT false,
    quantity INT DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'un',
    responsible_name VARCHAR(255) NOT NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    location_name VARCHAR(255),
    room VARCHAR(255),
    building VARCHAR(255),
    state_id UUID REFERENCES public.asset_states(id) ON DELETE SET NULL,
    state_name VARCHAR(100) NOT NULL,
    situation VARCHAR(100) DEFAULT 'Em uso',
    acquisition_value NUMERIC(15, 2),
    currency VARCHAR(10) DEFAULT 'Kz',
    acquisition_date DATE,
    supplier VARCHAR(255),
    invoice_number VARCHAR(255),
    estimated_current_value NUMERIC(15, 2),
    physical_check_status VARCHAR(50) DEFAULT 'found' CHECK (physical_check_status IN ('found', 'not_found', 'needs_verification')),
    notes TEXT,
    first_registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_inventoried_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_confirmed_by VARCHAR(255),
    last_confirmed_state VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. FOTOGRAFIAS DOS BENS
CREATE TABLE IF NOT EXISTS public.asset_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    photo_type VARCHAR(50) DEFAULT 'asset' CHECK (photo_type IN ('asset', 'label', 'serial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. PERFIS DE UTILIZADOR
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'DEPARTMENT_USER' CHECK (role IN ('ADMIN', 'DEPARTMENT_USER')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. REGISTOS DE AUDITORIA (LOGS)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- create, update, delete, state_change, complete, validate
    entity_type VARCHAR(100) NOT NULL, -- asset, inventory, department, category
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- DADOS INICIAIS (SEED DATA)
-- ========================================================

-- Categorias Iniciais
INSERT INTO public.categories (name, code, description, icon, is_custom) VALUES
('Tecnologia', 'TEC', 'Equipamentos de informática, eletrónicos e telecomunicações', 'laptop', false),
('Mobiliário', 'MOB', 'Mesas, cadeiras, armários e mobiliário geral', 'armchair', false),
('Cozinha', 'COZ', 'Eletrodomésticos, louças e utensílios de cozinha', 'utensils', false),
('Escritório', 'ESC', 'Material e equipamentos de apoio de escritório', 'briefcase', false),
('Ferramentas', 'FER', 'Ferramentas manuais, elétricas e equipamentos de manutenção', 'wrench', false),
('Transporte', 'TRA', 'Viaturas, motociclos e meios de transporte', 'car', false),
('Alojamento', 'ALO', 'Camas, colchões, roupa de cama e conforto em alojamentos', 'bed', false),
('Outros', 'OUT', 'Outros bens diversos não classificados', 'package', false)
ON CONFLICT (name) DO NOTHING;

-- Estados de Conservação Iniciais
INSERT INTO public.asset_states (code, name, color, is_custom) VALUES
('NEW', 'Novo', 'emerald', false),
('EXCELLENT', 'Excelente', 'green', false),
('GOOD', 'Bom', 'blue', false),
('REGULAR', 'Regular', 'yellow', false),
('BAD', 'Mau', 'amber', false),
('DAMAGED', 'Danificado', 'orange', false),
('UNUSABLE', 'Inutilizável', 'red', false),
('IN_REPAIR', 'Em reparação', 'purple', false),
('LOST', 'Perdido', 'rose', false),
('RETIRED', 'Abatido', 'slate', false)
ON CONFLICT (name) DO NOTHING;

-- Departamentos Exemplo
INSERT INTO public.departments (code, name, responsible_name, description) VALUES
('ADM', 'Administração', 'Carlos Silva', 'Direção Geral e Administração Central'),
('FIN', 'Finanças', 'João Pereira', 'Departamento Financeiro e Contabilidade'),
('RH', 'Recursos Humanos', 'Ana Santos', 'Gestão de Pessoas e Formação'),
('OPE', 'Operações', 'Maria Fernandes', 'Operações no terreno e Logística Geral'),
('IT', 'Tecnologias de Informação', 'Pedro IT', 'Suporte Técnico e Sistemas de Informação'),
('LOG', 'Logística & Armazém', 'Manuel Costa', 'Gestão de Stocks e Transportes'),
('ALO', 'Alojamento & Residências', 'Teresa Bento', 'Gestão de Quartos e Casas de Pessoal'),
('COZ', 'Cozinha Geral & Refeitório', 'Lúcia Martins', 'Serviço de Alimentação')
ON CONFLICT DO NOTHING;

-- Localizações Exemplo
INSERT INTO public.locations (building, floor, room, full_name, description) VALUES
('Edifício Principal', 'Piso 0', 'Receção', 'Edifício Principal -> Piso 0 -> Receção', 'Área de atendimento'),
('Edifício Principal', 'Piso 1', 'Sala Financeira', 'Edifício Principal -> Piso 1 -> Sala Financeira', 'Escritório de Finanças'),
('Edifício Principal', 'Piso 1', 'Gabinete IT', 'Edifício Principal -> Piso 1 -> Gabinete IT', 'Suporte de TI'),
('Bloco Operacional', 'Piso 0', 'Armazém Central', 'Bloco Operacional -> Piso 0 -> Armazém Central', 'Depósito de materiais'),
('Residência 1', 'Piso 1', 'Quarto 3', 'Residência 1 -> Piso 1 -> Quarto 3', 'Alojamento de pessoal'),
('Refeitório Central', 'Piso 0', 'Cozinha Principal', 'Refeitório Central -> Piso 0 -> Cozinha Principal', 'Área de preparação de refeições')
ON CONFLICT DO NOTHING;

-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público leitura categorias" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Acesso público leitura departamentos" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Acesso público leitura assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Escrita assets por utilizadores autenticados" ON public.assets FOR ALL USING (true);
CREATE POLICY "Acesso público leitura inventários" ON public.inventories FOR SELECT USING (true);
CREATE POLICY "Escrita inventários" ON public.inventories FOR ALL USING (true);
