<div align="center">

# 🧪 LabPulse OS

**Integrated operational management, role-based access control, and laboratory monitoring system.**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📋 Overview

**LabPulse OS** is a full-stack web platform designed to centralize laboratory workflows, operational traceability, and user governance. Built with a decoupled client-server architecture, the platform emphasizes security, granular permission-based data visibility, and cloud-native scalability.

### Key Features

* **Authentication & Security:** Complete JWT-based authentication flow, session protection guards, and strict CORS policy enforcement between client and server.
* **Role-Based Access Control (RBAC):** Data visibility scoping segmented by user role, ensuring operators only view and interact with modules and records authorized for their clearance level.
* **Administration & Settings:** Centralized administrative panel for managing system users, access permissions, and operational parameters.
* **Decoupled Cloud Architecture:** Independent RESTful API and static web client enabling isolated scaling, streamlined CI/CD, and modular maintenance.

---

## 🏗️ System Architecture & Tech Stack

```mermaid
flowchart LR
    Client["🌐 Web Client<br/>(React + Vite)<br/>Cloudflare"] -->|HTTPS / REST API| API["⚙️ Backend API<br/>(NestJS + Docker)<br/>Render"]
    API -->|Prisma ORM 7 / SSL| DB[("🗄️ PostgreSQL<br/>Database<br/>Neon Serverless")]
```

| Layer | Technologies | Cloud Infrastructure |
| :--- | :--- | :--- |
| **Front-end** | React, TypeScript, Vite | Cloudflare Workers / Pages (Static Assets) |
| **Back-end** | NestJS, Node.js, TypeScript | Render (Docker Container) |
| **ORM & Database** | Prisma ORM 7, PostgreSQL | Neon Serverless Postgres |
| **CI/CD** | GitHub Auto-Deploy | Continuous deployment via `main` branch |

---

## 📁 Repository Structure

```text
labpulse-os/
├── frontend/               # React + Vite web application
│   ├── public/             # Static assets and favicons
│   ├── src/                # Components, pages, API services, and auth contexts
│   └── package.json        # Client dependencies and build scripts
├── src/                    # NestJS API source code
│   ├── auth/               # JWT authentication, guards, and strategies
│   ├── users/              # User management and RBAC scoping
│   └── prisma/             # Database connection service
├── prisma/                 # Database schema and migrations (Prisma 7)
├── Dockerfile              # Multi-stage production container build
└── package.json            # Backend dependencies and scripts
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

* **Node.js** (v20 or higher)
* **npm** or **yarn**
* Active **PostgreSQL** instance (local or via [Neon](https://neon.tech))

### 1. Clone the repository

```bash
git clone https://github.com/arthurlaporto/labpulse-os.git
cd labpulse-os
```

### 2. Configure and run the Back-end

Install dependencies at the project root:

```bash
npm install
```

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@host:5432/labpulse?sslmode=require"
JWT_SECRET="your_secure_jwt_secret"
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="admin@labpulse.com"
ADMIN_SENHA="your_admin_password"
```

Generate the Prisma client, run database migrations, and start the development server:

```bash
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### 3. Configure and run the Front-end

In a separate terminal session, navigate to the `frontend` folder and install dependencies:

```bash
cd frontend
npm install
```

Create a `frontend/.env` file pointing to your local API:

```env
VITE_API_URL="http://localhost:3000"
```

Start the Vite development server:

```bash
npm run dev
```

The web interface will be accessible at `http://localhost:5173`.

---

## ☁️ Production Deployment Pipeline

The production environment runs continuous deployment triggered automatically on pushes to `main`:

1. **Database (Neon):** Serverless PostgreSQL instance connected securely via SSL (`DATABASE_URL`).
2. **API (Render):** Containerized via a custom `Dockerfile` that runs `npx prisma generate` prior to the TypeScript build (`npm run build`), ensuring full compatibility with Prisma 7's custom client output.
3. **Front-end (Cloudflare):** Static bundle built from the `frontend` root directory with `VITE_API_URL` injected at build time.

---

## 📸 Preview

> *Add screenshots of the login screen and main dashboard by saving images to `.github/assets/` and referencing them below:*
>
> ```markdown
> ![Login Screen](.github/assets/login.png)
> ![Main Dashboard](.github/assets/dashboard.png)
> ```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Developed by <a href="https://github.com/arthurlaporto">Arthur Lourenço de Araújo Porto</a>
</div>
