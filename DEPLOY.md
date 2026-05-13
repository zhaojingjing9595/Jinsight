# Deployment Plan — Jinsight

**Web:** Vercel · **API:** Render · **DB:** Supabase (already hosted)

---

## Phase 1 — Pre-deployment prep

**1. Environment variables audit**
- Collect all vars needed by each service (Supabase URL/keys, API URL, etc.)
- Create `.env.example` files for `apps/web` and `services/api` to document required vars

**2. Build validation**
- Ensure `pnpm build` passes for both `apps/web` and `services/api` locally
- Fix any TypeScript strict-mode errors that only surface in production builds

**3. CORS configuration**
- Update `services/api` to allow the production Vercel domain (currently `localhost:3000` only)

**4. Prisma production setup**
- Confirm `DATABASE_URL` in Supabase points to the **connection pooler** URL (port 6543, not 5432) for Render
- Add `prisma generate` to the Render build command

---

## Phase 2 — Deploy the API (Render)

1. Connect Render to the GitHub repo
2. Create a **Web Service** pointing to `services/api/`
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `node dist/index.js` (or `npm start`)
5. Set all env vars in Render dashboard
6. Note the public API URL (e.g. `https://jinsight-api.onrender.com`)

> **Free tier caveat:** Render free tier spins down after 15 min of inactivity — first request takes ~30s cold start. Upgrade to $7/mo Starter if that's unacceptable.

---

## Phase 3 — Deploy the Web (Vercel)

1. Connect Vercel to the GitHub repo
2. Set **Root Directory** to `apps/web`
3. Framework preset: **Next.js** (auto-detected)
4. Set env vars — critically `NEXT_PUBLIC_API_URL` → the Render API URL from Phase 2
5. Deploy

---

## Phase 4 — Post-deployment checklist

- [ ] Auth flows work end-to-end (Supabase redirect URLs updated to include the Vercel domain)
- [ ] tRPC calls from web → API succeed (check browser network tab)
- [ ] Prisma migrations are in sync with production DB (`npx prisma migrate deploy`)
- [ ] Add Vercel domain to Supabase's **allowed redirect URLs** in the Auth settings

---

## Biggest risks

| Risk | Fix |
|---|---|
| Supabase Auth redirect URLs not updated | Add Vercel URL in Supabase dashboard before testing login |
| CORS blocking API calls | Update `services/api` CORS origin list |
| Render cold starts breaking UX | Add a lightweight `/health` ping or upgrade plan |
| Monorepo build confusion on Vercel | Set root directory + verify `pnpm` is the package manager in Vercel settings |
