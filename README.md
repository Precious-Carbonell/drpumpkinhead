# DrPumpkinHead

Art commission website for digital artist DrPumpkinHead. Features a public portfolio with sakura/cherry blossom theme and an admin portal for managing commissions.

---

## Live Site

- Frontend: [drpumpkinhead.vercel.app](https://drpumpkinhead.vercel.app)
- Pricing: [/prices](https://drpumpkinhead.vercel.app/prices)
- Queue: [/queue](https://drpumpkinhead.vercel.app/queue)
- Socials: [/socials](https://drpumpkinhead.vercel.app/socials)

---

## Tech Stack

- React + TypeScript + Vite (frontend)
- Node.js + Express (backend API)
- Supabase / PostgreSQL (database)
- Recharts (dashboard charts)
- Lucide React (icons)

---

## Local Development

```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
npm run dev
```

Frontend runs on http://localhost:5173
Backend runs on http://localhost:3001

---

## Deployment

- Frontend: Vercel (auto-deploys from main branch)
- Backend: Render (auto-deploys from main branch)
- Database: Supabase (hosted PostgreSQL)

---

## Project Structure

```
client/          React frontend
  public/        Static assets (images, portfolio)
  src/pages/     Client + Admin pages
server/          Express API
  src/routes/    REST endpoints
  src/db/        Supabase client + audit logging
```

---

## License

All artwork and branding is property of DrPumpkinHead. Code is for personal/portfolio use.
