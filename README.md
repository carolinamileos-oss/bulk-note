# 🌿 Bulk Note — Gestão Alimentar Pessoal

Aplicação web completa para gestão da dieta de ganho de peso. Sistema pessoal de memória alimentar, planeamento de refeições e controlo de custos.

## ✨ Funcionalidades

- **Dashboard** — visão geral com estatísticas, gráficos e atalhos rápidos
- **Receitas** — gestão completa com macros, custos, notas pessoais e avaliações
- **Histórico** — registo diário de refeições com satisfação e observações
- **Planeamento Semanal** — calendário interativo com totais por dia
- **Lista de Compras** — gerada automaticamente a partir do planeamento
- **Análise de Custos** — comparação financeira entre receitas
- **Substituições** — alternativas de ingredientes com perfil nutricional

## 🛠️ Stack

- **Next.js 14** (App Router + Server Actions)
- **TypeScript**
- **Tailwind CSS** com design system sage/cream
- **Prisma ORM** com **SQLite** (pronto para PostgreSQL)
- **Recharts** para gráficos
- **Radix UI** para componentes acessíveis

---

## 🚀 Instalação e execução

### Pré-requisitos

- **Node.js 18+** — [Descarregar aqui](https://nodejs.org)
- **npm** (incluído com Node.js)

### Passos

```bash
# 1. Entra na pasta do projeto
cd bulk-note

# 2. Instala dependências
npm install

# 3. Cria e aplica o schema da base de dados
npx prisma db push

# 4. Popula com dados de exemplo
npm run db:seed

# 5. Inicia o servidor de desenvolvimento
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) no browser. ✅

### Comando único (se preferires)

```bash
npm install && npx prisma db push && npm run db:seed && npm run dev
```

---

## 📁 Estrutura do projeto

```
bulk-note/
├── prisma/
│   ├── schema.prisma          # Schema da base de dados
│   ├── seed.ts                # Dados de exemplo
│   └── dev.db                 # SQLite (gerado automaticamente)
│
├── src/
│   ├── app/
│   │   ├── page.tsx           # Dashboard
│   │   ├── layout.tsx         # Layout com sidebar
│   │   ├── globals.css        # Estilos globais + design tokens
│   │   │
│   │   ├── recipes/           # Gestão de receitas
│   │   │   ├── page.tsx       # Lista de receitas
│   │   │   ├── new/page.tsx   # Nova receita
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Detalhe da receita
│   │   │       └── edit/page.tsx
│   │   │
│   │   ├── history/page.tsx   # Histórico alimentar
│   │   ├── planning/page.tsx  # Planeamento semanal
│   │   ├── shopping/page.tsx  # Lista de compras
│   │   ├── costs/page.tsx     # Análise de custos
│   │   ├── substitutions/page.tsx
│   │   │
│   │   └── api/               # API Routes
│   │       ├── recipes/
│   │       ├── ingredients/
│   │       ├── meal-history/
│   │       ├── meal-plans/
│   │       ├── shopping-list/
│   │       ├── costs/
│   │       └── substitutions/
│   │
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── ui/               # Componentes base (button, card, dialog...)
│   │   ├── dashboard/        # DashboardCharts
│   │   ├── recipes/          # RecipeForm, RecipesFilter, DeleteButton...
│   │   ├── planning/         # WeeklyPlanner
│   │   ├── shopping/         # ShoppingListClient
│   │   ├── history/          # AddHistoryDialog
│   │   ├── costs/            # CostsCharts
│   │   └── substitutions/    # AddSubstitutionDialog
│   │
│   ├── lib/
│   │   ├── prisma.ts         # Cliente Prisma singleton
│   │   └── utils.ts          # Funções de cálculo, formatação, labels
│   │
│   └── hooks/
│       └── use-toast.ts      # Hook de notificações
│
├── .env                       # DATABASE_URL
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 🗄️ Modelo de dados

```
Recipe          — receitas com metadados, notas e avaliações
Ingredient      — ingredientes com macros e custo por unidade
RecipeIngredient — tabela de ligação receita↔ingrediente
MealHistory     — registo histórico de refeições consumidas
MealPlan        — plano semanal
MealPlanItem    — refeição dentro de um plano
ShoppingList    — lista de compras
ShoppingListItem — item individual da lista
Substitution    — alternativas entre ingredientes
```

---

## 📊 Dados de exemplo incluídos

O seed cria automaticamente:

- **8 receitas** de ganho de peso:
  - Overnight Oats Proteica ⭐⭐⭐⭐⭐
  - Panquecas de Banana e Aveia ⭐⭐⭐⭐
  - Arroz com Frango e Legumes ⭐⭐⭐⭐
  - Massa com Carne Picada ⭐⭐⭐⭐
  - Iogurte com Granola e Fruta ⭐⭐⭐⭐⭐
  - Sandes Proteica de Frango ⭐⭐⭐
  - Batido Hipercalórico ⭐⭐⭐⭐
  - Tosta com Ovos e Abacate ⭐⭐⭐⭐⭐

- **30 ingredientes** com macros e custos reais
- **17 registos de histórico** dos últimos 7 dias
- **1 plano semanal** completo (semana atual)
- **1 lista de compras** gerada
- **5 substituições** de ingredientes

---

## 🔧 Scripts disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run db:push      # Aplica schema ao SQLite
npm run db:seed      # Popula dados de exemplo
npm run db:studio    # Abre Prisma Studio (GUI da base de dados)
```

---

## 🔮 Migração para PostgreSQL (futuro)

Quando quiseres migrar para PostgreSQL, apenas precisas de:

1. Alterar o provider no `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // era "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Atualizar o `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/bulknote"
```

3. Correr:
```bash
npx prisma migrate dev --name init
```

---

## 🎨 Design

- **Tipografia**: Playfair Display (títulos) + DM Sans (corpo)
- **Paleta**: Sage green + Cream + White
- **Componentes**: Radix UI + Tailwind CSS
- **Responsivo**: Mobile-first, sidebar colapsável em mobile
- **Dark mode**: Não incluído (extensão futura fácil com CSS variables)

---

## 💡 Dicas de uso

1. **Começa pelas receitas** — adiciona as tuas receitas habituais
2. **Usa o planeamento** — planeia a semana e gera a lista de compras automaticamente
3. **Regista o histórico** — para ver padrões e receitas favoritas
4. **Consulta os custos** — para identificar as receitas com melhor custo-benefício
5. **Prisma Studio** — corre `npm run db:studio` para ver/editar dados diretamente

---

*Bulk Note — construído com Next.js 14, Prisma e SQLite*
