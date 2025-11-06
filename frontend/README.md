# SkillSync

A micro-mentorship platform with a React (Vite) frontend and a Django REST API backend. Learners can find mentors by skill, request sessions, and rate completed sessions. Mentors accept requests and can paste a Zoom link for accepted sessions so both sides can join.

## Tech Stack
- Frontend: React 18, Redux Toolkit, React Router v6, Bootstrap 5, Vite
- Backend: Django 5, Django REST Framework, SimpleJWT, SQLite (dev)

## Run
- Backend
  - py -3.11 -m venv backend\.venv
  - backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
  - backend\.venv\Scripts\python.exe backend\manage.py migrate
  - backend\.venv\Scripts\python.exe backend\manage.py runserver 8000
- Frontend
  - cd frontend && npm install && npm run dev

## Common commands
- Lint: cd frontend && npm run lint
- Tests backend: cd backend && python manage.py test api
- Tests frontend: cd frontend && npm run test

## Project structure
- backend/api: models (Skill, Profile, Session, Rating, Message), views, serializers, urls
- backend/skill_sync: settings and project urls
- frontend/src
  - features: Redux slices (auth, mentors, sessions)
  - components: shared components (SessionCard, Navbar)
  - pages: Login, Register, Finder, Dashboard, Profile

## Key flows
- Auth: JWT (login -> tokens -> axios interceptor attaches access token; refresh on 401)
- Find mentors: filter by skill/search, view mentor profile
- Request session: learner selects mentor, duration, scheduled time, description
- Accept session: mentor accepts; now can paste a Zoom “Join” link
- Join session: both sides see the “Join Session” link on accepted sessions
- Complete and rate: either side marks complete, learner rates from dashboard

## Design choices
- Manual Zoom link: avoids OAuth complexity; mentors create a Zoom meeting and paste the join URL. This works without public HTTPS or Marketplace setup.
- State: Redux Toolkit for predictable async flows (createAsyncThunk) and normalized session updates.
- API pagination-friendly: frontend handles both paginated and non-paginated results (results || data).

## Notes
- If you previously enabled Zoom OAuth in code, it’s now disabled in the UI. Manual link is the source of truth.
- To seed demo data: cd backend && python manage.py seed_demo