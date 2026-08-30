# LeadFlow — Admin Portal

This is the LeadFlow administration portal. It provides an intuitive dashboard for managing brands, custom form schemas, domain routing, lead tracking, buyer integrations, and delivery analytics.

---

## Quick Setup (Step-by-Step)

Follow these simple steps to run the Admin Portal locally on your computer.

### Step 1: Open Your Terminal
Navigate into the `admin-portal` folder:
```bash
cd admin-portal
```

### Step 2: Install Dependencies
Run the following command to download and install all necessary packages:
```bash
npm install
```

### Step 3: Set Up Your Environment Variables (`.env.local`)
The application needs configuration values (like database keys) to connect to Supabase and handle administrative actions.

1. In this `admin-portal/` folder, find the file named `.env.local.example`.
2. Make a copy of it and name the new file `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Open `.env.local` in your code editor.
4. Fill in the values for each key:
   - **`NEXT_PUBLIC_SUPABASE_URL`**: Your Supabase project URL (from Supabase Dashboard > Project Settings > API > Project URL).
   - **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Your Supabase anonymous public key (from Supabase Dashboard > Project Settings > API > anon key).
   - **`SUPABASE_SERVICE_ROLE_KEY`**: Your Supabase secret service key (from Supabase Dashboard > Project Settings > API > service_role key).
   - **`TRUSTEDFORM_API_KEY`**: (Optional / Testing) ActiveProspect TrustedForm API key.
   - **`DNC_SCRUB_API_KEY`**: (Optional / Testing) National Do-Not-Call compliance API key.

> **Note:** Never commit or share your `.env.local` file. It is automatically ignored by Git.

### Step 4: Start the Local Development Server
Run:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your web browser to access the Admin Portal!

---

## Key Features

- **Dashboard**: High-level overview of revenue, conversion rates, and recent lead traffic.
- **Brands & Form Builder**: Visual editor to configure branding themes and dynamic form fields.
- **Buyers**: Manage lead buyers, delivery endpoints, pricing tiers, and acceptance thresholds.
- **Domains**: Manage custom domains and SSL status mappings for brands.
- **Leads & Deliveries**: Inspect detailed lead data, compliance verification records, and buyer payloads.

---

## Available Scripts

- `npm run dev` — Starts the Next.js development server on port 3001.
- `npm run build` — Creates an optimized production build.
- `npm run start` — Runs the production build on port 3001.
- `npm run lint` — Checks code style with ESLint.
- `npx tsc --noEmit` — Validates TypeScript types across the project.
