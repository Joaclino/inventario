# Plataforma de Inventário Geral de Bens e Ativos

Uma mini aplicação web profissional, **Mobile First**, desenvolvida para realizar o levantamento físico e gestão contínua de todos os bens e ativos de uma organização.

---

## 📱 Destaques da Aplicação

1. **Mobile First & Levantamento Rápido (< 1 Minuto)**:
   - Formulário em 6 passos simples (O que é? Onde está? Quem é responsável? Estado? Foto? Guardar).
   - Captura de imagem com câmara ([ 📷 TIRAR FOTO ]) ou galeria ([ 🖼️ ESCOLHER FOTO ]).
   - Suporta foto do bem, etiqueta patrimonial e número de série.
2. **Abusabilidade Abrangente (Sem limitação apenas a TI)**:
   - Suporta qualquer bem físico: Tecnologia, Mobiliário, Cozinha, Escritório, Ferramentas, Transporte, Alojamento e Outros.
   - Suporta bens individuais (ex: Laptop HP, `ORG-000001`) e bens em lote/quantidade (ex: 35 Pratos de Cerâmica, `ORG-COZ-0001`).
3. **As 3 Abas Principais por Inventário de Departamento**:
   - **ABA 1 — BENS**: Lista de bens em cards no telemóvel, pesquisa rápida, filtros e funcionalidade **Confirmar Presença** (✅ Encontrado, ❌ Ausente, ⚠️ Verificar).
   - **ABA 2 — RESUMO**: Estatísticas e gráficos automáticos por categoria, estado de conservação, localização e totais financeiros em Kz.
   - **ABA 3 — INFORMAÇÕES**: Metadados do inventário, estado (🟡 Em andamento, 🟢 Concluído, 🔵 Validado), notas gerais e assinaturas digitais do responsável e do Administrador IT.
4. **Gerador de Etiquetas Patrimoniais & QR Code**:
   - Geração automática de código único (`ORG-000001` ou `ORG-COZ-0001`).
   - Leitura pública/interna de QR Code em `/asset/[assetId]`.
   - Impressão de etiquetas patrimoniais e ficha técnica completa.
5. **Painel de Administração / IT Master (`/admin`)**:
   - Dashboard com totalizadores (ex: 1.247 bens), por departamento e estados críticos (danificados, perdidos, em manutenção).
   - Gestão dinâmica de **Categorias, Subcategorias, Localizações e Estados** sem alterar o código.
   - Pesquisa global combinada.
   - Exportação para Excel com 3 folhas formatadas (`INVENTÁRIO`, `RESUMO`, `INFORMAÇÕES`) e Exportação Geral da organização.
   - Relatórios oficiais com suporte a impressão e PDF (`@media print`).

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **UI & Modos**: React 19 + TypeScript + Tailwind CSS
- **Ícones**: Lucide React
- **Base de Dados & Storage**: Supabase (PostgreSQL + RLS + Storage)
- **Persistência Local & Offline**: LocalStorage / Fallback Offline Sync
- **Relatórios & QR**: SheetJS (`xlsx`), `qrcode`, `recharts`

---

## ⚙️ Instalação e Desenvolvimento Local

### 1. Clonar o repositório e instalar dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente (Opcional para Supabase Live)
Crie um ficheiro `.env.local` na raiz do projeto com as credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key
```

> **Nota**: A aplicação possui um fallback local automático extremamente resiliente. Mesmo sem configurar o Supabase imediatamente, a aplicação funciona a 100% no navegador e telemóvel para testes e demonstração física.

### 3. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra o navegador em `http://localhost:3000`.

---

## 🗄️ Configuração do Supabase & Migrations

Para associar à sua base de dados PostgreSQL no Supabase:

1. Aceda ao [Supabase Dashboard](https://app.supabase.com) e crie um novo projeto.
2. No menu **SQL Editor**, execute o script presente no ficheiro `supabase/schema.sql`.
3. O script criará automaticamente:
   - Tabelas: `departments`, `categories`, `subcategories`, `locations`, `asset_states`, `inventories`, `assets`, `asset_photos`, `user_profiles`, `audit_logs`.
   - Políticas de segurança Row Level Security (RLS).
   - Dados iniciais (seed data) com departamentos, categorias e estados padrão.

### Configurar o Supabase Storage para Fotografias
1. No menu **Storage**, crie um novo bucket público chamado `asset-photos`.
2. Adicione a política de acesso para permitir leitura pública e upload por utilizadores autenticados.

---

## 🚀 Deployment na Vercel

1. Faça push do código para o GitHub/GitLab.
2. Importe o repositório na [Vercel](https://vercel.com).
3. Adicione as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Clique em **Deploy**.

---

## 🔑 Perfis de Acesso & Primeiro Administrador

Para testar no ambiente local ou de demonstração:
- **Perfil ADMIN / IT**: Aceda a `/admin` ou selecione "ADMIN / IT" na página de login. Permite gerir categorias, localizações, validar inventários e exportar relatórios gerais.
- **Perfil UTILIZADOR DE DEPARTAMENTO**: Aceda a `/departments` ou `/inventory/[departmentId]` para realizar o levantamento no terreno.
