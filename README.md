# 🏋️‍♂️ Fitly — Sistema de Gestão de Serviços para Personal Trainers

**Fitly** é um projeto autoral desenvolvido para portfólio, que simula um sistema completo de **gestão de serviços, agenda e alunos** para personal trainers.

O foco do projeto é demonstrar habilidades em **frontend, UX, modelagem de regras de negócio e arquitetura de aplicações**, resolvendo um problema real do mercado fitness: a organização da rotina do personal trainer.


---

## 🎯 Objetivo do Projeto

Demonstrar a capacidade de:

- Pensar um produto digital do zero
- Modelar fluxos de usuários (personal e aluno)
- Criar regras de negócio reais
- Desenvolver dashboards orientados à produtividade
- Organizar serviços, agenda e atendimentos
- Construir um sistema completo com visão de produto

---

## 👥 Tipos de Usuário

### 🧑‍🏫 Personal Trainer
Usuário principal da aplicação.

Responsável por:
- Criar e gerenciar serviços
- Organizar agenda de aulas
- Gerenciar alunos
- Controlar status das aulas
- Criar planos de treino

### 🧑‍💼 Aluno
Usuário que:
- Visualiza serviços do personal
- Agenda aulas
- Acessa planos de treino

---

## 🔐 Autenticação & Onboarding

- Cadastro com e-mail e senha
- Perfis separados por tipo de usuário
- Fluxo do personal:
  1. Criar conta
  2. Completar perfil profissional
  3. Criar serviços
  4. Organizar agenda
  5. Acessar dashboard

---

## 📊 Dashboard do Personal (Home)

Tela inicial após login, focada na **gestão diária**.

### Contém:
- Indicadores:
  - Aulas no mês
  - Alunos ativos
- Lista de aulas do dia
- Status das aulas:
  - Confirmada
  - Pendente
  - Cancelada
  - Concluída
- Acesso rápido às áreas:
  - Serviços
  - Agenda
  - Alunos

---

## 🧾 Serviços

Área central do sistema.

O personal define **o que ele vende**.

### Campos do serviço:
- Nome do serviço
- Descrição
- Duração (30min, 45min, 60min, etc.)
- Preço (valor informativo)

> O preço é utilizado apenas para **controle e referência**, não para cobrança dentro do app.

### Regras:
- Serviços podem ser editados
- Alterações **não afetam aulas já agendadas**
- Serviços podem ser desativados

---

## 📅 Agenda

Tela de organização de horários.

### Funcionalidades:
- Visualização diária / semanal
- Horários livres e ocupados
- Bloqueio de horários indisponíveis
- Prevenção de overbooking
- Acesso ao detalhe da aula

---

## 📌 Detalhe da Aula

Tela operacional para gerenciamento da aula.

### Informações exibidas:
- Dados do aluno
- Data e horário
- Tipo de treino
- Duração
- Status da aula

### Ações:
- Marcar aula como concluída
- Cancelar ou reagendar aula
- Enviar mensagem ao aluno
- Criar ou visualizar plano de treino

---

## 📋 Planos de Treino

- Planos personalizados por aluno
- Histórico mantido
- Visível apenas para o aluno vinculado
- Associado às aulas

---

## 🔔 Notificações

- Confirmação de agendamento
- Lembretes de aula
- Cancelamentos
- Atualizações de plano de treino

---

## 🧠 Regras de Negócio Trabalhadas

- Separação clara entre personal e aluno
- Controle de acesso por perfil
- Prevenção de conflitos de agenda
- Histórico imutável de aulas
- Estados bem definidos para aulas
- UX orientada à rotina do personal

---

## 🎨 UX / UI

- Design mobile-first
- Interface minimalista
- Hierarquia visual clara
- Foco em produtividade
- Wireframes e fluxos feitos no Figma

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React / Next.js
- **Estilização:** Tailwind CSS
- **Backend:** API Routes / Node.js
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma
- **Autenticação:** NextAuth

---

## 🚀 Status do Projeto

🟡 Em desenvolvimento  
📐 Regras de negócio definidas  
🎨 UX e fluxos estruturados  

---

## 👤 Autor

Projeto desenvolvido por **[Seu Nome]**  
Com foco em **Frontend, UX e Arquitetura de Sistemas**.

