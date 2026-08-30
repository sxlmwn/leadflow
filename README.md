# LeadFlow — Multi-Brand Lead-Gen Platform

LeadFlow is a high-performance, multi-brand lead-generation platform built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

This repository contains two independent, standalone Next.js applications:

```text
leadflow/
├── website/          # Public lead capture funnel & landing pages (Port 3000)
├── admin-portal/     # Admin dashboard, brand & form builder, analytics (Port 3001)
└── README.md         # Repository overview and guide
```

---

## Applications

### 1. [Website (Funnel)](./website)
- **Path**: [`website/`](./website)
- **Role**: Public-facing landing pages, dynamic multi-step lead capture forms, click tracking, TCPA consent verification pipeline (TrustedForm & DNC scrub), and buyer delivery.
- **Port**: Default `http://localhost:3000`
- **Setup Guide**: See [website/README.md](./website/README.md)

### 2. [Admin Portal](./admin-portal)
- **Path**: [`admin-portal/`](./admin-portal)
- **Role**: Internal administrative dashboard, brand & form schema editor, custom domain routing, buyer management, and delivery analytics.
- **Port**: Default `http://localhost:3001`
- **Setup Guide**: See [admin-portal/README.md](./admin-portal/README.md)

---

## Quick Start

Each application is completely self-contained with its own dependencies and configuration.

### Running Website:
```bash
cd website
npm install
cp .env.local.example .env.local
npm run dev
```

### Running Admin Portal:
```bash
cd admin-portal
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Deployment (Vercel)

Both applications are configured for deployment on Vercel with individual project root directories:
- **`leadflow-funnel`**: Root directory set to `website`
- **`leadflow-admin`**: Root directory set to `admin-portal`
