# Deploy (Free-tier friendly)

This guide uses:
- Frontend: Netlify (free static hosting)
- Backend: Fly.io (free small VM)

## Backend (Fly.io)
1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. From the repo root:
   - flyctl auth signup
   - cd backend
   - flyctl launch --copy-config --now  # accepts fly.toml and builds Dockerfile
3. Set secrets (at minimum):
   - flyctl secrets set SECRET_KEY=your_secret
   - flyctl secrets set DEBUG=False
   - flyctl secrets set ALLOWED_HOSTS=YOUR_FLY_APP.fly.dev
   - flyctl secrets set CORS_ALLOWED_ORIGINS=https://YOUR_NETLIFY_SITE.netlify.app
   - (Optional) flyctl secrets set DATABASE_URL=postgres://...  # if you attach Postgres
4. Deploy:
   - flyctl deploy --remote-only

Notes:
- Dockerfile builds static files; release_command runs DB migrations.
- If using SQLite, data resets on image redeploys. For persistence, attach free Postgres or a volume.

## Frontend (Netlify)
1. Create a new site from Git.
2. Build settings:
   - Base directory: frontend
   - Build command: npm run build
   - Publish directory: frontend/dist
3. Environment variables:
   - VITE_API_BASE=https://YOUR_FLY_APP.fly.dev/api/
4. (Optional) netlify.toml is included for SPA redirect and /api proxy during preview.

## Local production build
- Frontend: cd frontend && npm run build && npx serve -s dist
- Backend: DEBUG=False SECRET_KEY=... ALLOWED_HOSTS=localhost CORS_ALLOWED_ORIGINS=http://localhost:3000 python backend/manage.py runserver 8000

## Operational tips
- JWT lifetime configurable via ACCESS_TOKEN_MINUTES
- Update CORS_ALLOWED_ORIGINS when you change frontend domain
- Logs: flyctl logs, Netlify deploy logs