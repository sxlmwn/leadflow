# LeadFlow — Website & Lead Capture Funnel

This is the public-facing LeadFlow application. It powers multi-brand landing pages, dynamic multi-step lead capture forms, click tracking, TCPA consent verification (TrustedForm & DNC scrub), and buyer lead delivery.

---

## Quick Setup (Step-by-Step)

Follow these simple steps to run the website locally on your computer.

### Step 1: Open Your Terminal
Navigate into the `website` folder:
```bash
cd website
```

### Step 2: Install Dependencies
Run the following command to download and install all necessary packages:
```bash
npm install
```

### Step 3: Set Up Your Environment Variables (`.env.local`)
The application needs configuration values (like database keys) to work properly.

1. In this `website/` folder, find the file named `.env.local.example`.
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

Open [http://localhost:3000](http://localhost:3000) in your web browser to view the app!

---

## Testing Configured Brands Locally

You can preview configured brands and test themes locally by using the Dev Brand Switcher at the top of the page, or by adding the `?brand=<slug>` query parameter in your browser (e.g. `http://localhost:3000/?brand=footballnig`).

---

## Available Scripts

- `npm run dev` — Starts the Next.js development server on port 3000.
- `npm run build` — Creates an optimized production build.
- `npm run start` — Runs the production build.
- `npm run lint` — Checks code style with ESLint.
- `npx tsc --noEmit` — Validates TypeScript types across the project.
