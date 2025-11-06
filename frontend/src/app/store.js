import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mentorsReducer from '../features/mentors/mentorsSlice';
import sessionsReducer from '../features/sessions/sessionsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mentors: mentorsReducer,
    sessions: sessionsReducer,
    notifications: notificationsReducer,
  },
});
