# 🏋️ Fitly - Plataforma de Gerenciamento de Treinos

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Version](https://img.shields.io/badge/versão-0.1.0-blue)
![License](https://img.shields.io/badge/licença-MIT-green)
![Node](https://img.shields.io/badge/node-18+-success)

Uma plataforma moderna e intuitiva que conecta personal trainers e alunos, facilitando o gerenciamento, controle e acompanhamento de treinos com eficiência e precisão.

> ⚠️ **Status de desenvolvimento**: Este projeto está em desenvolvimento ativo. Funcionalidades podem evoluir e melhorias contínuas estão sendo implementadas.

---

## 📖 Visão Geral

**Fitly** é uma aplicação web full-stack desenvolvida com as mais modernas tecnologias da indústria. A plataforma resolve o desafio da comunicação e gerenciamento entre personal trainers e seus alunos, oferecendo dashboards intuitivos, processamento em tempo real e fluxos de trabalho otimizados.

### 🎯 Problema que resolve

Personal trainers enfrentam dificuldades em:

- Gerenciar treinos de múltiplos alunos de forma centralizada
- Acompanhar progresso e aderência ao plano de treino
- Comunicar ajustes e feedback em tempo real
- Organizar e armazenar histórico de treinos

Alunos precisam de:

- Acesso fácil aos treinos prescritos
- Visualização clara do progresso
- Comunicação direta com seu personal trainer

**Fitly** resolve estes desafios através de uma interface unificada e intuitiva.

---

## 🔄 Fluxo de Uso

```
┌─────────────────────────────────────────────────────────┐
│                    FITLY - USER FLOW                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣  Personal Trainer cria conta + onboarding         │
│       ↓                                                 │
│  2️⃣  Personal cria/configura treinos                   │
│       ↓                                                 │
│  3️⃣  Personal convida alunos                           │
│       ↓                                                 │
│  4️⃣  Aluno cria conta + aceita convite                │
│       ↓                                                 │
│  5️⃣  Aluno visualiza dashboard com treinos            │
│       ↓                                                 │
│  6️⃣  Aluno executa treinos + registra progresso       │
│       ↓                                                 │
│  7️⃣  Personal monitora evolução e ajusta treinos      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades

### 👥 Para Personal Trainers

| Funcionalidade             | Status       | Descrição                              |
| -------------------------- | ------------ | -------------------------------------- |
| Criar treinos customizados | ✅ Planejado | Criar planos de treino personalizados  |
| Gerenciar alunos           | ✅ Planejado | Visualizar e gerenciar lista de alunos |
| Monitorar progresso        | ✅ Planejado | Acompanhar desempenho e aderência      |
| Enviar convites            | ✅ Planejado | Convidar alunos para os programas      |
| Dashboard analítico        | ✅ Planejado | Relatórios e análises de desempenho    |
| Ajustar treinos            | ✅ Planejado | Atualizar exercícios em tempo real     |

### 👨‍🎓 Para Alunos

| Funcionalidade          | Status          | Descrição                       |
| ----------------------- | --------------- | ------------------------------- |
| Visualizar treinos      | ✅ Em progresso | Ver treinos prescritos          |
| Registrar execução      | ✅ Planejado    | Marcar série, repetições e peso |
| Acompanhar progresso    | ✅ Planejado    | Gráficos de evolução            |
| Histórico de treinos    | ✅ Planejado    | Consultar treinos passados      |
| Receber feedback        | ✅ Planejado    | Comunicação com o personal      |
| Dashboard personalizado | ✅ Em progresso | Visão geral do progresso        |

---

## 🚀 Roadmap

### Phase 1 - MVP (Em Desenvolvimento)

- [x] Autenticação e autorização
- [x] Diferenciação de tipos de usuário
- [x] Setup inicial do banco de dados
- [x] Onboarding dos usuários
- [ ] CRUD completo de treinos
- [ ] Sistema de convites
- [ ] Dashboards funcionais

### Phase 2 - Melhorias Core

- [ ] Sistema de mensagens em tempo real
- [ ] Notificações (email, push)
- [ ] Galeria de exercícios com imagens
- [ ] Estatísticas e relatórios avançados

### Phase 3 - Expansão

- [ ] Aplicativo mobile (iOS/Android)
- [ ] Integração com wearables
- [ ] Planos de treino templates
- [ ] Comunidade de usuários

---

## �️ Stack Tecnológico

O projeto utiliza um stack moderno e escalável, escolhido para performance, manutenibilidade e experiência do desenvolvedor.

### Backend & Frontend

| Tecnologia      | Versão  | Propósito                                     |
| --------------- | ------- | --------------------------------------------- |
| **Next.js**     | 16.1.6  | Framework React full-stack com API Routes     |
| **React**       | 19.2.3  | Biblioteca UI com hooks e Server Components   |
| **TypeScript**  | 5       | Tipagem estática completa                     |
| **NextAuth.js** | 4.24.13 | Autenticação segura e gerenciamento de sessão |

### Banco de Dados

| Tecnologia         | Versão | Propósito                              |
| ------------------ | ------ | -------------------------------------- |
| **PostgreSQL**     | Latest | Banco de dados relacional robusto      |
| **Prisma ORM**     | 7.4.0  | Query builder type-safe com migrations |
| **Prisma Adapter** | 7.4.0  | Integração com NextAuth.js             |

### Styling & UI

| Tecnologia       | Versão  | Propósito                              |
| ---------------- | ------- | -------------------------------------- |
| **Tailwind CSS** | 4       | Utility-first CSS framework            |
| **Radix UI**     | 1.4.3   | Componentes acessíveis e customizáveis |
| **Lucide React** | 0.575.0 | Ícones modernos e consistentes         |
| **React Icons**  | 5.5.0   | Alternativa adicional de ícones        |

### Testes & Quality

| Tecnologia          | Versão | Propósito                        |
| ------------------- | ------ | -------------------------------- |
| **Jest**            | 30.2.0 | Framework de testes unitários    |
| **Testing Library** | 16.3.2 | Testes com foco em comportamento |
| **ESLint**          | 9      | Linting e qualidade de código    |

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** 18 ou superior - [Download](https://nodejs.org/)
- **npm**, **yarn**, **pnpm** ou **bun** (gerenciador de pacotes)
- **PostgreSQL** 12 ou superior - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

Verifique as versões instaladas:

```bash
node --version      # v18+
npm --version       # 9+
postgres --version  # 12+
```

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm, yarn, pnpm ou bun
- PostgreSQL instalado e rodando

### Passos

1. **Clone o repositório**

```bash
git clone <seu-repositorio>
cd my-app
```

2. **Instale as dependências**

```bash
npm install
# ou yarn install / pnpm install / bun install
```

3. **Configure as variáveis de ambiente**

```bash
# Crie um arquivo .env.local
cp .env.example .env.local
```

4. **Configure o banco de dados**

```bash
# Execute as migrações do Prisma
npx prisma migrate dev
```

---

## 🏃 Como Executar

### Ambiente de Desenvolvimento

```bash
npm run dev
# ou yarn dev / pnpm dev / bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

### Build para Produção

```bash
npm run build
npm start
```

### Linter

```bash
npm run lint
```

---

## 📂 Estrutura do Projeto

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes (NextAuth, endpoints)
│   │   │   ├── auth/         # Configuração de autenticação
│   │   │   ├── client-requests/
│   │   │   └── personals/
│   │   ├── dashboard/        # Páginas do dashboard
│   │   │   ├── aluno/        # Dashboard do aluno
│   │   │   └── personal/     # Dashboard do personal
│   │   ├── onboarding/       # Páginas de onboarding
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Home page
│   ├── lib/
│   │   ├── prisma.ts         # Configuração do Prisma
│   │   └── types.ts          # Tipos TypeScript compartilhados
│   └── _components/          # Componentes reutilizáveis
├── prisma/
│   ├── schema.prisma         # Schema do banco de dados
│   └── migrations/           # Migrações do banco
└── public/                   # Arquivos estáticos

```

---

## 🔐 Autenticação

O projeto utiliza **NextAuth.js** integrado com **Prisma Adapter** e suporta diferentes tipos de usuários:

- Personal Trainer
- Aluno

A autenticação é gerenciada através das rotas em `src/app/api/auth/`.

---

## � Endpoints da API

### Autenticação

- `POST /api/auth/signin` - Login de usuário
- `POST /api/auth/signout` - Logout de usuário
- `POST /api/auth/set-user-type` - Define tipo de usuário (personal/aluno)

### Treinos

- `GET /api/client-requests` - Listar convites de treino
- `POST /api/client-requests` - Criar novo convite
- `GET /api/client-requests/[id]` - Detalhes de um convite
- `DELETE /api/client-requests/[id]` - Remover convite

### Personals

- `GET /api/personals` - Listar personals
- `GET /api/personals/[id]` - Detalhes de um personal

---

## �💾 Banco de Dados

O projeto usa **Prisma ORM** com PostgreSQL. As migrações estão versionadas em `prisma/migrations/`.

Para criar uma nova migração:

```bash
npx prisma migrate dev --name nome_da_migracao
```
