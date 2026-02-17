# Fitly

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Tipo](https://img.shields.io/badge/tipo-web%20app-blue)
![Licença](https://img.shields.io/badge/licença-MIT-green)

Um sistema completo de gerenciamento de treinos que conecta personal trainers e alunos em uma plataforma moderna e intuitiva.

⚠️ **Status**: Este projeto está em **desenvolvimento ativo**. Funcionalidades podem mudar e bugs podem estar presentes.

## 📋 Sobre

Fitly é uma aplicação web desenvolvida para facilitar o gerenciamento de treinos entre personal trainers e seus alunos. O sistema permite que personais criem, monitorem e atualizem os treinos de seus alunos, enquanto os alunos acompanham seus progressos e recebem orientações em tempo real.

---

## 🔨 Status de Desenvolvimento

### ✅ Concluído

- [x] Autenticação e registro de usuários
- [x] Diferenciação de tipos de usuário (Personal/Aluno)
- [x] Estrutura de banco de dados (Prisma + PostgreSQL)
- [x] Onboarding básico

### 🚧 Em Construção

- [ ] Criar/editar/deletar treinos
- [ ] Enviar convites para alunos
- [ ] Dashboard para personal
- [ ] Dashboard para aluno
- [ ] Visualizar progresso e histórico

### 📋 Planejado

- [ ] Sistema de mensagens
- [ ] Notificações em tempo real
- [ ] Galeria de exercícios
- [ ] Relatórios e análises
- [ ] Aplicativo mobile

---

## ✨ Funcionalidades Principais

### Para Personal Trainers

- ✅ Criar e gerenciar treinos customizados
- ✅ Monitorar progresso e desempenho dos alunos
- ✅ Visualizar lista de alunos vinculados
- ✅ Atualizar exercícios e séries em tempo real
- ✅ Dashboard análítico com dados de treinos

### Para Alunos

- ✅ Visualizar treinos atribuídos
- ✅ Registrar execução de treinos
- ✅ Acompanhar evolução e histórico
- ✅ Receber feedback do personal
- ✅ Dashboard personalizado com progresso

---

## 🎯 Fluxo de Uso

```
1. Personal cria uma conta e se registra no sistema
      ↓
2. Personal cria treinos e convida alunos
      ↓
3. Aluno cria conta e aceita convite do personal
      ↓
4. Aluno visualiza seus treinos e começa a treinar
      ↓
5. Personal monitora progresso e ajusta treinos conforme necessário
```

---

## 🚀 Tecnologias Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org) - React framework para produção
- **Autenticação**: [NextAuth.js 4](https://next-auth.js.org) - Solução de autenticação
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org) com [Prisma ORM](https://www.prisma.io)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- **Linguagem**: [TypeScript](https://www.typescriptlang.org) - JavaScript com tipagem estática
- **Ícones**: [React Icons](https://react-icons.github.io/react-icons) - Biblioteca de ícones

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
