# SkillSync - React + Django Conversion

## Overview

This project has been converted from Next.js/TypeScript to a production-ready stack:
- **Frontend**: React (JavaScript) + Vite + Bootstrap 5 + Redux Toolkit
- **Backend**: Django + Django REST Framework + JWT Authentication
- **Database**: SQLite (development), easily switchable to PostgreSQL

---

## Project Structure

```
skillsync/
├── backend/              # Django REST API
│   ├── api/             # Main Django app
│   │   ├── models.py    # User, Profile, Skill, Session, Rating, Message
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── management/commands/seed_demo.py
│   ├── skill_sync/      # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── api/        # Axios instance with JWT interceptors
│   │   ├── app/        # Redux store
│   │   ├── features/   # Redux slices (auth, mentors, sessions)
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README_CONVERSION.md (this file)
```

---

## Backend Setup

### 1. Prerequisites
- Python 3.10+
- pip
- virtualenv (recommended)

### 2. Installation

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings (optional for development)

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Seed demo data
python manage.py seed_demo

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver 8000
```

Backend will be available at: http://localhost:8000

### 3. Django Admin
Access admin panel at: http://localhost:8000/admin
- Username: `admin`
- Password: `admin123` (or your superuser credentials)

---

## Frontend Setup

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Installation

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:3000

### 3. Build for Production

```bash
npm run build
npm run preview
```

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register/
Register a new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password2": "string",
  "first_name": "string",
  "last_name": "string"
}
```

#### POST /api/auth/token/
Get JWT tokens
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

#### POST /api/auth/token/refresh/
Refresh access token
```json
{
  "refresh": "jwt_refresh_token"
}
```

#### GET /api/auth/me/
Get current user profile (requires authentication)

#### PATCH /api/auth/me/
Update current user profile
```json
{
  "first_name": "string",
  "bio": "string",
  "is_mentor": true,
  "skill_ids": [1, 2, 3],
  "availability": [
    {"day": 1, "start": "09:00", "end": "17:00"}
  ]
}
```

### Mentor Endpoints

#### GET /api/mentors/
List all mentors (supports filtering)
Query params:
- `skill`: Filter by skill name
- `skill_id`: Filter by skill ID
- `search`: Search by name
- `ordering`: Sort by `profile__rating_avg` or `username`
- `page`: Page number

#### GET /api/mentors/{id}/
Get specific mentor details

### Session Endpoints

#### GET /api/sessions/
List user's sessions (as requester or mentor)
Query params:
- `type`: `upcoming` or `past`
- `status`: `requested`, `accepted`, `completed`, `cancelled`

#### POST /api/sessions/
Create new session request
```json
{
  "mentor_id": 1,
  "skill_id": 1,
  "duration_minutes": 30,
  "description": "string",
  "scheduled_time": "2024-12-31T14:00:00Z"
}
```

#### POST /api/sessions/{id}/accept/
Mentor accepts a session (mentor only)

#### POST /api/sessions/{id}/complete/
Mark session as completed (participants only)

### Rating Endpoints

#### GET /api/ratings/
List ratings
Query params:
- `mentor_id`: Filter by mentor

#### POST /api/ratings/
Create rating for completed session
```json
{
  "session_id": 1,
  "score": 5,
  "comment": "string"
}
```

### Skill Endpoints

#### GET /api/skills/
List all skills

### Message Endpoints (Mock Chat)

#### GET /api/messages/?session={id}
Get messages for a session

#### POST /api/messages/
Send a message
```json
{
  "session_id": 1,
  "text": "string"
}
```

---

## Demo Accounts

After running `python manage.py seed_demo`, you'll have:

**Admin:**
- Username: `admin` | Password: `admin123`

**Learners:**
- Username: `alice` | Password: `password123`
- Username: `bob` | Password: `password123`

**Mentors:**
- Username: `sarah_mentor` | Password: `password123` (React, JavaScript, Node.js)
- Username: `mike_mentor` | Password: `password123` (Python, Django, PostgreSQL)
- Username: `emma_mentor` | Password: `password123` (Docker, AWS, Git)
- Username: `john_mentor` | Password: `password123` (React, TypeScript, JavaScript)

---

## Migration Mapping: TypeScript → JavaScript

### File Mapping

| Original TypeScript File | New JavaScript File | Notes |
|--------------------------|---------------------|-------|
| `src/app/page.tsx` | `frontend/src/pages/Home.jsx` | Converted to React Router page |
| `src/app/layout.tsx` | `frontend/src/App.jsx` | Main app wrapper with routing |
| `src/app/dashboard/page.tsx` | `frontend/src/pages/Dashboard.jsx` | Dashboard with Bootstrap |
| `src/store/userSlice.ts` | `frontend/src/features/auth/authSlice.js` | Enhanced with JWT auth |
| `src/store/sessionSlice.ts` | `frontend/src/features/sessions/sessionsSlice.js` | Full CRUD operations |
| `src/components/ui/MentorCard.tsx` | `frontend/src/components/MentorCard.jsx` | Bootstrap styled |
| `src/components/ui/MentorList.tsx` | `frontend/src/pages/Finder.jsx` | Mentor finder page |
| `src/components/forms/MentorRequestForm.tsx` | `frontend/src/components/SessionRequestForm.jsx` | Session request with validation |
| `prisma/schema.prisma` | `backend/api/models.py` | Django ORM models |
| Next Auth | `djangorestframework-simplejwt` | JWT authentication |

### Key Changes

1. **TypeScript → JavaScript**: All `.tsx/.ts` files converted to `.jsx/.js` with PropTypes for type checking
2. **Next.js → React Router**: Page-based routing replaced with React Router v6
3. **Styled Components → Bootstrap**: Custom CSS replaced with Bootstrap 5 utility classes
4. **Prisma → Django ORM**: Database schema migrated to Django models
5. **NextAuth → JWT**: Authentication switched to djangorestframework-simplejwt
6. **Server Components → Client Components**: All Next.js server logic moved to Django REST API

---

## Testing

### Backend Tests
```bash
cd backend
python manage.py test api
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## Docker Deployment (Optional)

### Docker Compose

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - SECRET_KEY=your-secret-key
    
  frontend:
    build: ./frontend
    command: npm run dev -- --host
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### Run with Docker

```bash
docker-compose up --build
```

---

## QA Acceptance Checklist

- [ ] **Register**: Create new user via `/register` and verify profile at `/api/auth/me/`
- [ ] **Login**: Login returns JWT tokens and redirects to dashboard
- [ ] **Mentor List**: Visit `/finder` and see list of mentors with skills and ratings
- [ ] **Filter Mentors**: Filter mentors by skill using dropdown/search
- [ ] **Request Session**: Click "Request Session" on mentor card, fill form, submit successfully
- [ ] **View Dashboard**: See upcoming and past sessions on `/dashboard`
- [ ] **Accept Session** (as mentor): Login as mentor, accept pending request
- [ ] **Complete Session**: Mark session as completed
- [ ] **Rate Session**: Rate completed session, verify rating appears on mentor profile
- [ ] **Update Profile**: Edit bio, skills, and availability on `/profile`
- [ ] **Responsive UI**: Verify Bootstrap responsive layout works on mobile/tablet/desktop
- [ ] **Token Refresh**: Verify automatic token refresh on 401 errors
- [ ] **Logout**: Logout clears tokens and redirects to home

---

## Production Considerations

### Security
1. **Change SECRET_KEY** in Django settings for production
2. **Use httpOnly cookies** for token storage instead of localStorage
3. **Enable HTTPS** for all API requests
4. **Configure CORS** to only allow your frontend domain
5. **Use PostgreSQL** instead of SQLite

### Environment Variables

Backend `.env`:
```
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.com
DATABASE_URL=postgresql://user:password@host:port/dbname
```

Frontend `.env`:
```
VITE_API_URL=https://api.your-domain.com
```

### Database Migration
To switch to PostgreSQL:

```bash
pip install psycopg2-binary

# Update settings.py DATABASES:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'skillsync',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## Support & Contribution

For issues or questions, please refer to the original codebase or create an issue in the repository.

---

## License

Same license as the original SkillSync project.
