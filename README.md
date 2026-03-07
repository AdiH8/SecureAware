# SecureAware Advanced Demo v2

Full-stack demo платформа за обучение по киберсигурност с:
- role-based UX (`EMPLOYEE`, `MANAGER`, `ADMIN`)
- scenario-based testing + timed simulations
- risk engine (knowledge, reaction risk, behavioral band)
- adaptive assignment rules
- manager dashboard с analytics

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Recharts
- Supabase client (optional, fallback to in-memory store)
- Vitest unit/integration tests

## Local Start

```powershell
cd "C:\Users\Adi\Desktop\proekt digitalen\secureaware-v2"
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Demo Routes

- `/` landing
- `/login` demo role login
- `/employee/home`
- `/employee/training/mod_phishing_core`
- `/employee/simulation/scn_phishing_invoice`
- `/manager/dashboard`
- `/manager/department/dept_sales`
- `/admin/content`

## API Endpoints

- `POST /api/attempts`
- `GET /api/dashboard?departmentId=&range=`
- `POST /api/assignments/recompute`
- `POST /api/learning/complete-content`
- `POST /api/tests/start`
- `POST /api/tests/answer`
- `POST /api/tests/finish`
- `GET /api/employee/learning-state`
- `POST /api/auth/login`
- `POST /api/auth/logout`

## Test Commands

```powershell
npm run test
npm run test:coverage
npm run lint
```

## Supabase Setup (Optional)

1. Create `.env.local` from `.env.example`
2. Add keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run SQL files in Supabase SQL editor:
   - `supabase/schema.sql`
   - `supabase/seed.sql`

If env vars are missing, app runs with seeded in-memory data.

## Netlify Deploy

1. Push project to Git repo
2. Create new site in Netlify from repo
3. Build command: `npm run build`
4. Publish dir: `.next`
5. Add env vars from `.env.example`

`netlify.toml` is included with `@netlify/plugin-nextjs`.
