# 🏋️ Fitly - Plataforma de Gerenciamento de Treinos

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Version](https://img.shields.io/badge/versão-0.1.0-blue)
![License](https://img.shields.io/badge/licença-MIT-green)
![Node](https://img.shields.io/badge/node-18+-success)
[![Build](https://github.com/pedroLima019/Fitly/actions/workflows/ci.yml/badge.svg)](https://github.com/pedroLima019/Fitly/actions)

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
│  2️⃣  Personal completa perfil (especialidades, etc.)  │
│       ↓                                                 │
│  3️⃣  Aluno busca personal e envia solicitação         │
│       ↓                                                 │
│  4️⃣  Personal aceita/recusa solicitação               │
│       ↓                                                 │
│  5️⃣  Conexão estabelecida: chat em tempo real         │
│       ↓                                                 │
│  6️⃣  Personal cria treinos para o aluno               │
│       ↓                                                 │
│  7️⃣  Aluno visualiza e executa treinos                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades

### 👥 Para Personal Trainers

| Funcionalidade             | Status          | Descrição                             |
| -------------------------- | --------------- | ------------------------------------- |
| Dashboard personalizado    | ✅ Implementado | Visão geral com alunos e solicitações |
| Gerenciar solicitações     | ✅ Implementado | Aceitar/recusar pedidos de alunos     |
| Chat em tempo real         | ✅ Implementado | Comunicação via Socket.io             |
| Notificações               | ✅ Implementado | Alertas de novas solicitações         |
| Perfil completo            | ✅ Implementado | Especialidades, preço, localização    |
| Criar treinos customizados | 🔄 Em progresso | Criar planos de treino personalizados |
| Monitorar progresso        | 📋 Planejado    | Acompanhar desempenho e aderência     |

### 👨‍🎓 Para Alunos

| Funcionalidade          | Status          | Descrição                           |
| ----------------------- | --------------- | ----------------------------------- |
| Dashboard personalizado | ✅ Implementado | Visão geral com treinos e personals |
| Buscar personals        | ✅ Implementado | Encontrar profissionais disponíveis |
| Enviar solicitações     | ✅ Implementado | Solicitar conexão com personal      |
| Chat em tempo real      | ✅ Implementado | Comunicação via Socket.io           |
| Notificações            | ✅ Implementado | Status das solicitações             |
| Perfil completo         | ✅ Implementado | Objetivos, nível, limitações        |
| Visualizar treinos      | 🔄 Em progresso | Ver treinos prescritos              |
| Registrar execução      | 📋 Planejado    | Marcar série, repetições e peso     |
| Acompanhar progresso    | 📋 Planejado    | Gráficos de evolução                |

---

## 🚀 Roadmap

### Phase 1 - MVP ✅

- [x] Autenticação e autorização (NextAuth.js)
- [x] Diferenciação de tipos de usuário (Personal/Aluno)
- [x] Schema do banco de dados com Prisma
- [x] Onboarding completo para ambos perfis
- [x] Sistema de solicitações (enviar/aceitar/recusar/cancelar)
- [x] Dashboard funcional para personal e aluno
- [x] Busca de personals com filtros
- [x] Chat em tempo real (Socket.io)
- [x] Sistema de notificações
- [x] Rate limiting e validação com Zod
- [x] Soft deletes para auditoria

### Phase 2 - Treinos (Em Desenvolvimento)

- [x] Modelo de Training e Exercise no banco
- [ ] CRUD completo de treinos
- [ ] Atribuição de treinos a alunos
- [ ] Visualização de treinos pelo aluno
- [ ] Execução e registro de treinos

### Phase 3 - Melhorias Core

- [ ] Notificações push
- [ ] Galeria de exercícios com imagens/vídeos
- [ ] Estatísticas e relatórios avançados
- [ ] Histórico de treinos

### Phase 4 - Expansão

- [ ] Aplicativo mobile (iOS/Android)
- [ ] Integração com wearables
- [ ] Planos de treino templates
- [ ] Sistema de avaliações

---

## 🛠️ Stack Tecnológico

O projeto utiliza um stack moderno e escalável, escolhido para performance, manutenibilidade e experiência do desenvolvedor.

### Backend & Frontend

| Tecnologia      | Versão  | Propósito                                     |
| --------------- | ------- | --------------------------------------------- |
| **Next.js**     | 16.1.6  | Framework React full-stack com App Router     |
| **React**       | 19.2.3  | Biblioteca UI com hooks e Server Components   |
| **TypeScript**  | 5       | Tipagem estática completa                     |
| **NextAuth.js** | 4.24.13 | Autenticação segura e gerenciamento de sessão |
| **Socket.io**   | 4.8.3   | Comunicação em tempo real (chat)              |
| **Zod**         | 4.3.6   | Validação de schemas type-safe                |

### Banco de Dados

| Tecnologia             | Versão | Propósito                              |
| ---------------------- | ------ | -------------------------------------- |
| **PostgreSQL**         | Latest | Banco de dados relacional robusto      |
| **Prisma ORM**         | 7.4.0  | Query builder type-safe com migrations |
| **@prisma/adapter-pg** | 7.4.0  | Driver PostgreSQL nativo para Prisma   |

### Styling & UI

| Tecnologia       | Versão  | Propósito                              |
| ---------------- | ------- | -------------------------------------- |
| **Tailwind CSS** | 4       | Utility-first CSS framework            |
| **Radix UI**     | 1.4.3   | Componentes acessíveis e customizáveis |
| **shadcn/ui**    | 3.8.5   | Componentes reutilizáveis              |
| **Lucide React** | 0.575.0 | Ícones modernos e consistentes         |
| **React Icons**  | 5.5.0   | Biblioteca adicional de ícones         |

### Testes & Qualidade

| Tecnologia          | Versão | Propósito                        |
| ------------------- | ------ | -------------------------------- |
| **Jest**            | 30.2.0 | Framework de testes              |
| **Testing Library** | 16.3.2 | Testes com foco em comportamento |
| **ESLint**          | 9      | Linting e qualidade de código    |
| **Pino**            | 10.3.1 | Logging estruturado              |

### Cache & Performance

| Tecnologia        | Versão | Propósito             |
| ----------------- | ------ | --------------------- |
| **Upstash Redis** | 1.37.0 | Cache e rate limiting |
| **Redis**         | 5.11.0 | Client Redis          |

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

### Passos

1. **Clone o repositório**

```bash
git clone https://github.com/pedroLima019/Fitly.git
cd Fitly/my-app
```

2. **Instale as dependências**

```bash
npm install
# ou yarn install / pnpm install / bun install
```

3. **Configure as variáveis de ambiente**

```bash
# Copie o arquivo de exemplo e preencha os valores:
cp .env.example .env
# Edite o arquivo .env com suas credenciais:
# - DATABASE_URL
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
# - REDIS_URL / REDIS_TOKEN (opcional)
```

4. **Configure o banco de dados**

```bash
# Gere o Prisma Client
npx prisma generate

# Execute as migrações
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

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev           # Inicia o servidor de desenvolvimento
npm run lint          # Executa o ESLint
npm run test          # Executa todos os testes
npm run test:watch    # Testes em modo watch
npm run test:coverage # Testes com relatório de cobertura

# Produção
npm run build         # Cria build de produção
npm run start         # Inicia servidor de produção

# Prisma
npm run prisma:generate # Gera o Prisma Client
```

---

## ✅ Testes e Integração Contínua

O projeto utiliza **Jest** e **Testing Library** para garantir a qualidade do código. Todos os testes são executados automaticamente via **GitHub Actions** a cada push ou pull request.

### Rodar testes localmente

```bash
npm test
npm run test:coverage # Para relatório de cobertura
```

### CI/CD

O workflow está em `.github/workflows/ci.yml` e executa:

- Instalação de dependências
- Configuração do ambiente
- Execução dos testes

---

## 📂 Estrutura do Projeto

```
my-app/
├── src/
│   ├── app/
│   │   ├── _components/          # Componentes compartilhados do app
│   │   │   ├── BottomMenu.tsx    # Menu inferior mobile
│   │   │   ├── ChatBox.tsx       # Componente de chat
│   │   │   ├── Header.tsx        # Cabeçalho global
│   │   │   └── *NotificationBell.tsx  # Notificações
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/             # NextAuth.js
│   │   │   ├── client-requests/  # Solicitações aluno→personal
│   │   │   ├── messages/         # Sistema de mensagens
│   │   │   ├── notifications/    # Sistema de notificações
│   │   │   ├── personals/        # Busca de personals
│   │   │   └── profile/          # Perfil do usuário
│   │   ├── dashboard/
│   │   │   ├── aluno/            # Dashboard do aluno
│   │   │   │   ├── buscar-personal/
│   │   │   │   ├── chats/
│   │   │   │   ├── complete-perfil/
│   │   │   │   └── minhas-solicitacoes/
│   │   │   └── personal/         # Dashboard do personal
│   │   │       ├── chats/
│   │   │       ├── complete-perfil/
│   │   │       └── solicitacoes/
│   │   ├── onboarding/           # Fluxo de onboarding
│   │   ├── layout.tsx            # Layout principal
│   │   └── page.tsx              # Home page
│   ├── components/
│   │   └── ui/                   # Componentes UI (shadcn)
│   ├── hooks/
│   │   ├── useCepLookup.ts       # Hook para busca de CEP
│   │   └── useSocket.ts          # Hook para Socket.io
│   ├── lib/
│   │   ├── api-client.ts         # Cliente API utilitário
│   │   ├── logger.ts             # Logging com Pino
│   │   ├── prisma.ts             # Instância do Prisma
│   │   ├── rate-limit.ts         # Rate limiting
│   │   ├── utils.ts              # Utilitários gerais
│   │   └── validators.ts         # Schemas Zod
│   ├── pages/
│   │   └── api/
│   │       └── socket.io.ts      # Servidor Socket.io
│   ├── types/                    # Tipos TypeScript
│   └── middleware.ts             # Middleware Next.js
├── prisma/
│   ├── schema.prisma             # Schema do banco de dados
│   └── migrations/               # Migrações do banco
├── public/                       # Arquivos estáticos
└── package.json
```

---

## 🔐 Autenticação

O projeto utiliza **NextAuth.js** integrado com **Prisma Adapter** e suporta diferentes tipos de usuários:

- **Personal Trainer** - Cria treinos, gerencia alunos
- **Aluno** - Busca personals, executa treinos

### Fluxo de Autenticação

1. Login via OAuth (Google, etc.)
2. Seleção do tipo de usuário (Personal/Aluno)
3. Onboarding com dados do perfil
4. Acesso ao dashboard específico

---

## 🔌 Endpoints da API

### Autenticação

| Método | Endpoint                  | Descrição              |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/auth/signin`        | Login de usuário       |
| POST   | `/api/auth/signout`       | Logout de usuário      |
| POST   | `/api/auth/set-user-type` | Define tipo de usuário |

### Solicitações (Client Requests)

| Método | Endpoint                           | Descrição                          |
| ------ | ---------------------------------- | ---------------------------------- |
| GET    | `/api/client-requests`             | Lista solicitações (com paginação) |
| POST   | `/api/client-requests`             | Cria nova solicitação              |
| GET    | `/api/client-requests/[id]`        | Detalhes de uma solicitação        |
| PATCH  | `/api/client-requests/[id]`        | Atualiza status (aceitar/recusar)  |
| POST   | `/api/client-requests/[id]/cancel` | Cancela solicitação (soft delete)  |

### Mensagens

| Método | Endpoint                      | Descrição                       |
| ------ | ----------------------------- | ------------------------------- |
| GET    | `/api/messages`               | Lista mensagens de uma conversa |
| POST   | `/api/messages`               | Envia nova mensagem             |
| GET    | `/api/messages/conversations` | Lista conversas do usuário      |
| POST   | `/api/messages/mark-as-read`  | Marca mensagens como lidas      |

### Notificações

| Método | Endpoint                    | Descrição                     |
| ------ | --------------------------- | ----------------------------- |
| GET    | `/api/notifications`        | Lista notificações do usuário |
| GET    | `/api/notifications/unread` | Contagem de não lidas         |

### Personals

| Método | Endpoint         | Descrição                   |
| ------ | ---------------- | --------------------------- |
| GET    | `/api/personals` | Lista personals disponíveis |

### Perfil

| Método | Endpoint                | Descrição                  |
| ------ | ----------------------- | -------------------------- |
| GET    | `/api/profile/personal` | Dados do perfil (personal) |
| PUT    | `/api/profile/personal` | Atualiza perfil (personal) |
| GET    | `/api/profile/student`  | Dados do perfil (aluno)    |
| PUT    | `/api/profile/student`  | Atualiza perfil (aluno)    |

---

## 💾 Banco de Dados

### Modelos Principais

- **User** - Usuários (personal/aluno) com perfil completo
- **Training** - Treinos com exercícios
- **Exercise** - Exercícios individuais (séries, repetições, peso)
- **ClientRequest** - Solicitações de conexão aluno→personal
- **PersonalStudent** - Relação estabelecida personal↔aluno
- **Message** - Mensagens do chat
- **Notification** - Notificações do sistema

### Comandos Prisma

```bash
# Gerar Prisma Client
npx prisma generate

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Visualizar banco no Prisma Studio
npx prisma studio
```

---

## 🔒 Segurança

O projeto implementa diversas camadas de segurança:

- **Rate Limiting** - Proteção contra abuso de endpoints
- **Validação Zod** - Schemas type-safe para todas as entradas
- **Soft Deletes** - Auditoria de dados deletados
- **Permissões** - Verificação de tipos de usuário
- **JWT Caching** - Redução de queries no banco

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato

**Pedro Lima** - [@pedroLima019](https://github.com/pedroLima019)

Link do Projeto: [https://github.com/pedroLima019/Fitly](https://github.com/pedroLima019/Fitly)
