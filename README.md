# SkillSync - Micro-Mentorship Platform

A production-ready skill exchange and mentorship platform built with **React + Django**.

## 🚀 Quick Start

### Backend (Terminal 1)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 8000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** and login with:
- **Learner:** alice / password123
- **Mentor:** sarah_mentor / password123

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[README_CONVERSION.md](README_CONVERSION.md)** - Complete documentation with API reference
- **[FILE_STRUCTURE.md](FILE_STRUCTURE.md)** - Architecture and file descriptions
- **[FILES_CREATED.md](FILES_CREATED.md)** - Complete file checklist

## 🎯 Features

- **Authentication:** JWT-based with automatic token refresh
- **User Roles:** Learners and Mentors
- **Skills System:** Tag-based skill matching
- **Sessions:** Request, accept, complete workflow
- **Ratings:** 5-star rating system with reviews
- **Search:** Filter mentors by skill and availability
- **Responsive UI:** Bootstrap 5 design

## 🛠️ Tech Stack

### Backend
- Django 5.0 + Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- SQLite (dev) / PostgreSQL (production)
- CORS enabled

### Frontend
- React 18 (JavaScript)
- Redux Toolkit for state management
- React Router v6
- Bootstrap 5
- Axios with interceptors
- Vite (fast build tool)

## 📁 Project Structure

```
skillsync/
├── backend/          # Django REST API
│   ├── api/         # Main app (models, views, serializers)
│   └── skill_sync/  # Project settings
│
├── frontend/        # React application
│   └── src/
│       ├── api/     # Axios configuration
│       ├── app/     # Redux store
│       ├── features/# Redux slices
│       ├── components/
│       └── pages/
│
└── docs/            # Documentation files
```

## 🧪 Testing

**Backend:**
```bash
cd backend
python manage.py test api
```

**Frontend:**
```bash
cd frontend
npm run test
```

## 🐳 Docker (Optional)

See `README_CONVERSION.md` for Docker setup instructions.

## 📄 License

Same license as the original SkillSync project.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Need help?** Check out the documentation files listed above or open an issue.
