# LeadFlow — Multi-Brand Lead-Gen Platform

LeadFlow is a multi-brand lead-generation platform built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Monorepo Architecture (npm Workspaces)

```text
leadflow/
├── apps/
│   └── funnel/         # Multi-brand landing & lead capture application (Port 3000)
├── packages/
│   └── shared/         # Shared TypeScript interfaces (Brand, Lead, Buyer, Verification types)
├── supabase/           # Single shared source of truth database migrations & config
├── docs/               # Platform documentation & task guidelines
└── scratch/            # Cross-cutting integration test scripts
```

## Getting Started

### 1. Install Dependencies
Run `npm install` from the root directory to link all workspace packages:
```bash
npm install
```

### 2. Running Application

- **Run Funnel App (Landing Pages & Lead Capture)**:
  ```bash
  npm run dev
  # or
  npm run dev:funnel
  ```
  App will start at `http://localhost:3000`.

### 3. Build & Quality Checks

Run workspace commands across packages:
```bash
npm run build    # Builds funnel app
npm run lint     # Lints all workspace packages
npm run tsc      # Type-checks all workspace packages
```

### 4. Local Brand Testing (Funnel App)
Switch between brands dynamically using dev overrides:
- **WindowHound**: `http://localhost:3000/?brand=windowhound`
- **MedTrialMatch**: `http://localhost:3000/?brand=medtrialmatch`
- **ReliefOlogist**: `http://localhost:3000/?brand=reliefologist`
