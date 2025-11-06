import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './features/auth/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Finder from './pages/Finder';
import MentorProfile from './pages/MentorProfile';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import NotificationCenter from './components/NotificationCenter';
import { ENABLE_NOTIFICATIONS } from './config';

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      {ENABLE_NOTIFICATIONS && <NotificationCenter />}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/finder"
            element={
              <PrivateRoute>
                <Finder />
              </PrivateRoute>
            }
          />
          <Route
            path="/mentors/:id"
            element={
              <PrivateRoute>
                <MentorProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
