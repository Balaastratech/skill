# SkillSync - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment (Windows)
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed demo data
python manage.py seed_demo

# Start backend server
python manage.py runserver 8000
```

Backend will run at: **http://localhost:8000**

### Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend will run at: **http://localhost:3000**

---

## 🎯 Test the Application

### Demo Login Credentials

**Learner Account:**
- Username: `alice`
- Password: `password123`

**Mentor Account:**
- Username: `sarah_mentor`
- Password: `password123`

### Test Flow

1. **Register** a new account at `/register`
2. **Login** with your credentials
3. **Find Mentors** at `/finder`
4. **Request a Session** by clicking on a mentor
5. **View Dashboard** to see your sessions
6. **Accept Sessions** (login as mentor: sarah_mentor)
7. **Rate Sessions** after completion

---

## 📁 Project Structure

```
skillsync/
├── backend/               # Django REST API
│   ├── api/              # API app with models, views, serializers
│   ├── skill_sync/       # Django settings
│   └── manage.py
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── app/         # Redux store
│   │   ├── features/    # Redux slices
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── App.jsx
│   └── package.json
```

---

## 🔧 Key Features Implemented

✅ **Backend (Django + DRF)**
- JWT authentication
- User profiles with mentor/learner roles
- Skills system
- Session management (request, accept, complete)
- Rating and review system
- Mock chat messages
- Admin panel at `/admin` (username: admin, password: admin123)

✅ **Frontend (React + Bootstrap)**
- User registration and login
- Protected routes
- Mentor finder with filters
- Session request flow
- Dashboard with upcoming/past sessions
- Profile editing
- Rating system
- Responsive Bootstrap UI

---

## 📚 API Endpoints

**Authentication:**
- POST `/api/auth/register/` - Register new user
- POST `/api/auth/token/` - Login and get JWT tokens
- POST `/api/auth/token/refresh/` - Refresh access token
- GET `/api/auth/me/` - Get current user profile
- PATCH `/api/auth/me/` - Update profile

**Mentors:**
- GET `/api/mentors/` - List mentors (with filters)
- GET `/api/mentors/{id}/` - Get mentor details

**Sessions:**
- GET `/api/sessions/` - List user's sessions
- POST `/api/sessions/` - Create session request
- POST `/api/sessions/{id}/accept/` - Accept session
- POST `/api/sessions/{id}/complete/` - Complete session

**Ratings:**
- GET `/api/ratings/` - List ratings
- POST `/api/ratings/` - Create rating

**Skills:**
- GET `/api/skills/` - List all skills

---

## 🛠️ Troubleshooting

### Backend Issues

**Port already in use:**
```bash
python manage.py runserver 8080  # Use different port
```

**Database errors:**
```bash
rm db.sqlite3
python manage.py migrate
python manage.py seed_demo
```

### Frontend Issues

**Port already in use:**
Edit `vite.config.js` and change port to 3001

**Axios connection errors:**
- Make sure backend is running on port 8000
- Check CORS settings in backend `settings.py`

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Component Overview

### Page Components
- **Home** - Landing page with CTA
- **Login** - User authentication
- **Register** - New user registration
- **Dashboard** - View and manage sessions
- **Finder** - Browse and filter mentors
- **MentorProfile** - View mentor details and request sessions
- **Profile** - Edit user profile and settings

### UI Components
- **Navbar** - Navigation with auth state
- **PrivateRoute** - Protected route wrapper
- **MentorCard** - Mentor display card
- **SessionCard** - Session display with actions
- **LoadingSpinner** - Loading indicator

---

## 📖 Next Steps

1. **Read Full Documentation:** See `README_CONVERSION.md` for detailed setup
2. **Explore API:** Visit http://localhost:8000/api/ for browsable API
3. **Admin Panel:** Access http://localhost:8000/admin/
4. **Test Authentication:** Try JWT token refresh flow
5. **Customize:** Modify styles in `frontend/src/index.css`

---

## 🐛 Common Issues

**Token expired errors:**
- The refresh token logic should handle this automatically
- If persists, clear localStorage and login again

**CORS errors:**
- Check `CORS_ALLOWED_ORIGINS` in backend settings
- Ensure frontend URL matches (default: http://localhost:3000)

**Cannot find module errors:**
- Make sure all imports match the created file structure
- Check file names are exactly as created (case-sensitive)

---

## 📞 Support

For detailed documentation, see:
- `README_CONVERSION.md` - Full setup and API docs
- Django Admin: http://localhost:8000/admin/
- DRF Browsable API: http://localhost:8000/api/

Happy coding! 🎉
