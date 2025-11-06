# SkillSync - Complete File Structure

## 📂 Project Overview

```
skillsync/
│
├── backend/                          # Django REST API Backend
│   ├── api/                          # Main Django app
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seed_demo.py      # Demo data seeding command
│   │   ├── __init__.py
│   │   ├── admin.py                  # Django admin configuration
│   │   ├── apps.py                   # App configuration
│   │   ├── models.py                 # Database models (User, Profile, Skill, Session, Rating, Message)
│   │   ├── permissions.py            # Custom DRF permissions
│   │   ├── serializers.py            # DRF serializers
│   │   ├── urls.py                   # API URL routing
│   │   └── views.py                  # API views and viewsets
│   │
│   ├── skill_sync/                   # Django project settings
│   │   ├── __init__.py
│   │   ├── asgi.py                   # ASGI configuration
│   │   ├── settings.py               # Main settings (DRF, JWT, CORS)
│   │   ├── urls.py                   # Project URL configuration
│   │   └── wsgi.py                   # WSGI configuration
│   │
│   ├── .env.example                  # Environment variables template
│   ├── manage.py                     # Django management script
│   └── requirements.txt              # Python dependencies
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Axios instance with JWT interceptors
│   │   │
│   │   ├── app/
│   │   │   └── store.js              # Redux store configuration
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── authSlice.js      # Auth Redux slice (login, register, profile)
│   │   │   ├── mentors/
│   │   │   │   └── mentorsSlice.js   # Mentors Redux slice
│   │   │   └── sessions/
│   │   │       └── sessionsSlice.js  # Sessions Redux slice
│   │   │
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx    # Loading component
│   │   │   ├── MentorCard.jsx        # Mentor card component
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── PrivateRoute.jsx      # Protected route wrapper
│   │   │   └── SessionCard.jsx       # Session card component
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # User dashboard
│   │   │   ├── Finder.jsx            # Mentor finder/search
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── MentorProfile.jsx     # Mentor profile detail
│   │   │   ├── Profile.jsx           # User profile edit
│   │   │   └── Register.jsx          # Registration page
│   │   │
│   │   ├── App.jsx                   # Main App component with routing
│   │   ├── index.css                 # Global styles
│   │   └── main.jsx                  # Entry point
│   │
│   ├── .eslintrc.cjs                 # ESLint configuration
│   ├── index.html                    # HTML template
│   ├── package.json                  # NPM dependencies and scripts
│   └── vite.config.js                # Vite configuration
│
├── FILE_STRUCTURE.md                 # This file
├── QUICKSTART.md                     # Quick start guide
└── README_CONVERSION.md              # Comprehensive documentation
```

---

## 🔍 File Descriptions

### Backend Files

#### Core Django Files

**`backend/manage.py`**
- Django's command-line utility for administrative tasks
- Used for migrations, running server, creating superuser, etc.

**`backend/skill_sync/settings.py`**
- Main Django settings file
- Configures: Database, CORS, REST Framework, JWT authentication
- Defines installed apps and middleware

**`backend/skill_sync/urls.py`**
- Project-level URL configuration
- Routes all `/api/` requests to the API app

#### API App Files

**`backend/api/models.py`**
- Defines database models:
  - `Profile`: Extended user profile with mentor info
  - `Skill`: Skills that can be taught/learned
  - `Session`: Mentorship session bookings
  - `Rating`: Session ratings and reviews
  - `Message`: Mock chat messages

**`backend/api/serializers.py`**
- DRF serializers for all models
- Handles data validation and transformation
- Includes nested serializers for complex relationships

**`backend/api/views.py`**
- API endpoints implementation using DRF ViewSets
- Custom actions for accepting/completing sessions
- Filtering, pagination, and permissions

**`backend/api/permissions.py`**
- Custom permission classes
- Controls who can accept sessions, create ratings, etc.

**`backend/api/admin.py`**
- Django admin interface configuration
- Allows easy management of data through web UI

**`backend/api/management/commands/seed_demo.py`**
- Custom Django management command
- Seeds database with demo users, mentors, skills, and sessions
- Run with: `python manage.py seed_demo`

### Frontend Files

#### Configuration Files

**`frontend/vite.config.js`**
- Vite build tool configuration
- Sets up development server on port 3000
- Configures proxy to backend API

**`frontend/package.json`**
- NPM package configuration
- Lists all dependencies (React, Redux, Bootstrap, etc.)
- Defines scripts: dev, build, lint, test

**`frontend/.eslintrc.cjs`**
- ESLint linting configuration
- Enforces code quality and React best practices

#### Source Files

**`frontend/src/main.jsx`**
- Application entry point
- Sets up Redux Provider and renders root App component

**`frontend/src/App.jsx`**
- Main application component
- Configures React Router with all routes
- Handles initial user authentication check

**`frontend/src/index.css`**
- Global CSS styles
- Custom classes for skill tags, cards, animations
- Complements Bootstrap styling

#### API Integration

**`frontend/src/api/axios.js`**
- Axios instance with custom configuration
- Request interceptor: Attaches JWT token to requests
- Response interceptor: Handles token refresh on 401 errors
- Implements automatic authentication retry logic

#### Redux Store

**`frontend/src/app/store.js`**
- Redux store configuration
- Combines all reducers (auth, mentors, sessions)

**`frontend/src/features/auth/authSlice.js`**
- Authentication state management
- Async thunks: login, register, fetchCurrentUser, updateProfile
- Stores user data and JWT token

**`frontend/src/features/mentors/mentorsSlice.js`**
- Mentors state management
- Fetches and filters mentor list
- Stores current mentor details

**`frontend/src/features/sessions/sessionsSlice.js`**
- Sessions state management
- CRUD operations for sessions
- Handles session acceptance and rating

#### Components

**`frontend/src/components/Navbar.jsx`**
- Top navigation bar
- Shows different links based on authentication state
- Includes logout functionality

**`frontend/src/components/PrivateRoute.jsx`**
- Route protection wrapper
- Redirects to login if user not authenticated

**`frontend/src/components/MentorCard.jsx`**
- Displays mentor information in a card
- Shows skills, rating, bio preview
- Clickable to navigate to mentor profile

**`frontend/src/components/SessionCard.jsx`**
- Displays session details
- Shows different actions based on user role and session status
- Accept button for mentors, rate button for learners

**`frontend/src/components/LoadingSpinner.jsx`**
- Simple loading indicator
- Used while fetching data

#### Pages

**`frontend/src/pages/Home.jsx`**
- Landing page
- Call-to-action buttons
- Feature highlights

**`frontend/src/pages/Login.jsx`**
- User login form
- Handles authentication with JWT
- Shows demo account credentials

**`frontend/src/pages/Register.jsx`**
- New user registration form
- Validates password match
- Redirects to login on success

**`frontend/src/pages/Dashboard.jsx`**
- User's main dashboard
- Tabbed interface for upcoming/past sessions
- Session acceptance and rating modals

**`frontend/src/pages/Finder.jsx`**
- Mentor search and discovery
- Filter by skill, search by name
- Grid layout of mentor cards

**`frontend/src/pages/MentorProfile.jsx`**
- Detailed mentor profile view
- Shows ratings and reviews
- Session request modal with form

**`frontend/src/pages/Profile.jsx`**
- User profile editing
- Update bio, skills, mentor status
- Checkbox-based skill selection

---

## 📊 Data Flow

### Authentication Flow
```
Login Page → authSlice.login → axios POST /api/auth/token/
→ Store tokens in localStorage → fetchCurrentUser
→ Navigate to Dashboard
```

### Session Request Flow
```
Finder → Click Mentor Card → MentorProfile
→ Click Request Session → Modal Form
→ sessionsSlice.createSession → axios POST /api/sessions/
→ Navigate to Dashboard → Session appears in Upcoming
```

### Token Refresh Flow
```
Any API Request → axios interceptor checks token
→ If 401 response → axios POST /api/auth/token/refresh/
→ Update access token → Retry original request
```

---

## 🔗 Key Relationships

### Backend Models
- `User` ↔ `Profile` (OneToOne)
- `Profile` ↔ `Skill` (ManyToMany)
- `User` ↔ `Session` (as requester or mentor)
- `Session` ↔ `Rating` (OneToOne)
- `Session` ↔ `Message` (OneToMany)

### Frontend State
- `authSlice` - Current user and authentication status
- `mentorsSlice` - List of mentors and filters
- `sessionsSlice` - User's sessions (upcoming/past)

---

## 🚀 Deployment Structure (Production)

For production deployment, you would add:

```
skillsync/
├── backend/
│   ├── Dockerfile              # Backend Docker image
│   ├── .dockerignore
│   └── staticfiles/            # Collected static files
│
├── frontend/
│   ├── Dockerfile              # Frontend Docker image
│   ├── .dockerignore
│   └── dist/                   # Production build
│
├── docker-compose.yml          # Orchestrates both services
├── nginx.conf                  # Reverse proxy config
└── .github/
    └── workflows/
        └── deploy.yml          # CI/CD pipeline
```

---

## 📝 Notes

- All frontend files are `.jsx` (no TypeScript)
- Backend uses standard Django/Python conventions
- Environment variables stored in `.env` (not committed)
- SQLite database file `db.sqlite3` (not committed)
- `node_modules/` and `.venv/` directories (not committed)

---

## 🔄 Development Workflow

1. Make changes to backend models → Run migrations
2. Make changes to API views → Test with DRF browsable API
3. Make changes to frontend → Hot reload updates instantly
4. Test full flow → Use demo accounts
5. Commit changes → Follow Git best practices

---

For detailed setup instructions, see `QUICKSTART.md` or `README_CONVERSION.md`.
