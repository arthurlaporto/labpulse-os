<div align="center">

# 🧪 LabPulse OS

**Sistema integrado de gestão operacional, controle de acesso e monitoramento laboratorial.**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[Acessar Aplicação](https://labpulse-os.pages.dev) · [Status da API](https://labpulse-os.onrender.com) · [Reportar Bug](https://github.com/arthurlaporto/labpulse-os/issues)

</div>

---

## 📋 Sobre o Projeto

O **LabPulse OS** é uma plataforma web full-stack projetada para centralizar rotinas laboratoriais, rastreabilidade de operações e governança de usuários. A aplicação foi construída com foco em segurança, isolamento de visibilidade por nível de permissão e alta disponibilidade em nuvem.

### Principais Funcionalidades

* **Autenticação e Segurança:** Fluxo completo de login protegido por JWT, validação de sessão no back-end e política estrita de CORS entre cliente e servidor.
* **Controle de Acesso Baseado em Perfis (RBAC):** Escopo de visibilidade de dados segmentado por nível de usuário (*Role-Based Access Control*), garantindo que cada operador acesse apenas os módulos e registros pertinentes à sua função.
* **Gestão e Configurações:** Painel administrativo para gerenciamento de usuários, parâmetros do sistema e monitoramento operacional.
* **Arquitetura Desacoplada:** API RESTful independente do cliente web, permitindo escalabilidade horizontal, deploys independentes e manutenção modular.

---

## 🏗️ Arquitetura e Stack Tecnológica

| Camada | Tecnologias | Hospedagem / Infraestrutura |
| :--- | :--- | :--- |
| **Front-end** | React, TypeScript, Vite | Cloudflare Workers / Pages (Static Assets) |
| **Back-end** | NestJS, Node.js, TypeScript | Render (Container Docker) |
| **ORM & Banco** | Prisma ORM 7, PostgreSQL | Neon Serverless Postgres |
| **CI/CD** | GitHub Auto-Deploy | Integração contínua via branch `main` |

```mermaid
flowchart LR
    User([Navegador / Operador]) -->|HTTPS| CF[Cloudflare Static Assets<br/>React + Vite]
    CF -->|REST API + JWT| Render[Render Docker Service<br/>NestJS + Prisma 7]
    Render -->|SSL / TCP| Neon[(Neon PostgreSQL<br/>Serverless DB)]
```

---

## 📁 Estrutura do Repositório

```text
labpulse-os/
├── frontend/               # Aplicação web em React + Vite
│   ├── public/             # Arquivos estáticos e favicons
│   ├── src/                # Componentes, páginas, serviços de API e contextos
│   └── package.json        # Dependências e scripts do cliente
├── src/                    # Código-fonte da API NestJS
│   ├── auth/               # Autenticação, guards e estratégias JWT
│   ├── users/              # Gestão de usuários e perfis de acesso
│   └── prisma/             # Serviço de conexão com o banco de dados
├── prisma/                 # Schema do banco e migrations (Prisma 7)
├── Dockerfile              # Build multi-stage otimizado para produção
└── package.json            # Dependências e scripts do back-end
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

* **Node.js** (v20 ou superior)
* **npm** ou **yarn**
* Instância **PostgreSQL** ativa (local ou via [Neon](https://neon.tech))

### 1. Clonar o repositório

```bash
git clone https://github.com/arthurlaporto/labpulse-os.git
cd labpulse-os
```

### 2. Configurar e iniciar o Back-end

Instale as dependências na raiz do projeto:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/labpulse?sslmode=require"
JWT_SECRET="sua_chave_secreta_segura"
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="admin@labpulse.com"
ADMIN_SENHA="sua_senha_admin"
```

Gere o cliente do Prisma, aplique as migrations no banco e inicie o servidor:

```bash
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

### 3. Configurar e iniciar o Front-end

Abra um segundo terminal, acesse a pasta `frontend` e instale as dependências:

```bash
cd frontend
npm install
```

Crie o arquivo `frontend/.env` apontando para a API local:

```env
VITE_API_URL="http://localhost:3000"
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A interface estará acessível em `http://localhost:5173`.

---

## ☁️ Arquitetura de Deploy (Produção)

O ambiente de produção opera com deploy contínuo automático a cada `push` na branch `main`:

1. **Banco de Dados (Neon):** PostgreSQL gerenciado com conexão segura via SSL (`DATABASE_URL`).
2. **API (Render):** Construída via `Dockerfile` customizado que executa `npx prisma generate` antes da compilação TypeScript (`npm run build`), garantindo compatibilidade total com o client gerado pelo Prisma 7.
3. **Front-end (Cloudflare):** Build estático gerado a partir do diretório raiz `frontend` com injeção da variável `VITE_API_URL` em tempo de compilação.

---

## 📸 Preview

> *Adicione aqui capturas de tela da tela de login e do dashboard principal salvando as imagens em `.github/assets/` e referenciando-as abaixo:*
>
> ```markdown
> ![Tela de Login](.github/assets/login.png)
> ![Dashboard Principal](.github/assets/dashboard.png)
> ```

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Desenvolvido por <a href="https://github.com/arthurlaporto">Arthur Laporto</a>
</div>
