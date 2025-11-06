import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';
import { addNotification } from '../notifications/notificationsSlice';
import { ENABLE_NOTIFICATIONS } from '../../config';


export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async (type, { rejectWithValue }) => {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await axiosInstance.get(`sessions/${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch sessions');
    }
  }
);

export const createSession = createAsyncThunk(
  'sessions/createSession',
  async (sessionData, thunkAPI) => {
    try {
      const dedupeKey = `dedupe:createSession:${JSON.stringify({
        mentor_id: sessionData.mentor_id,
        skill_id: sessionData.skill_id || null,
        duration_minutes: sessionData.duration_minutes,
        scheduled_time: sessionData.scheduled_time,
      })}`;
      const response = await axiosInstance.post('sessions/', sessionData, {
        headers: { 'X-Idempotency-Key': dedupeKey },
      });
      if (ENABLE_NOTIFICATIONS) {
        thunkAPI.dispatch(
          addNotification({
            title: 'Session Requested',
            message: 'Your session request has been sent to the mentor.',
            variant: 'success',
          })
        );
      }
      return response.data;
    } catch (error) {
      if (ENABLE_NOTIFICATIONS) {
        thunkAPI.dispatch(
          addNotification({
            title: 'Request Failed',
            message: error.response?.data?.detail || 'Failed to create session',
            variant: 'danger',
          })
        );
      }
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to create session');
    }
  }
);

export const acceptSession = createAsyncThunk(
  'sessions/acceptSession',
  async (sessionId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`sessions/${sessionId}/accept/`);
      if (ENABLE_NOTIFICATIONS) {
        thunkAPI.dispatch(
          addNotification({
            title: 'Session Accepted',
            message: 'Meeting link is ready. You can join from your dashboard.',
            variant: 'success',
          })
        );
      }
      return response.data;
    } catch (error) {
      if (ENABLE_NOTIFICATIONS) {
        thunkAPI.dispatch(
          addNotification({
            title: 'Accept Failed',
            message: error.response?.data?.error || 'Failed to accept session',
            variant: 'danger',
          })
        );
      }
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to accept session');
    }
  }
);

export const rateSession = createAsyncThunk(
  'sessions/rateSession',
  async (ratingData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('ratings/', ratingData);
      if (ENABLE_NOTIFICATIONS) {
        thunkAPI.dispatch(
          addNotification({
            title: 'Thanks for the Review',
            message: 'Your feedback has been submitted successfully.',
            variant: 'success',
          })
        );
      }
      return response.data;
    } catch (error) {
      if (ENABLE_NOTIFICATIONS) {
        thunkAPI.dispatch(
          addNotification({
            title: 'Review Failed',
            message: error.response?.data || 'Failed to rate session',
            variant: 'danger',
          })
        );
      }
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to rate session');
    }
  }
);

export const completeSession = createAsyncThunk(
  'sessions/completeSession',
  async (sessionId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`sessions/${sessionId}/complete/`);
      if (ENABLE_NOTIFICATIONS) {
        thunkAPI.dispatch(
          addNotification({
            title: 'Session Completed',
            message: 'Session marked as completed.',
            variant: 'success',
          })
        );
      }
      return response.data;
    } catch (error) {
      if (ENABLE_NOTIFICATIONS) {
        thunkAPI.dispatch(
          addNotification({
            title: 'Completion Failed',
            message: error.response?.data?.error || 'Failed to complete session',
            variant: 'danger',
          })
        );
      }
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to complete session');
    }
  }
);

export const updateMeetingUrl = createAsyncThunk(
  'sessions/updateMeetingUrl',
  async ({ sessionId, meeting_url }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`sessions/${sessionId}/`, { meeting_url });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update meeting link');
    }
  }
);

const initialState = {
  upcoming: [],
  past: [],
  loading: false,
  creating: false,
  error: null,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        const sessions = action.payload.results || action.payload;
        state.upcoming = sessions.filter(s => ['requested', 'accepted'].includes(s.status));
        state.past = sessions.filter(s => ['completed', 'cancelled'].includes(s.status));
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSession.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(acceptSession.fulfilled, (state, action) => {
        const index = state.upcoming.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.upcoming[index] = action.payload;
        }
      })
      .addCase(rateSession.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(completeSession.fulfilled, (state, action) => {
        const updated = action.payload;
        // Remove from upcoming if present
        state.upcoming = state.upcoming.filter((s) => s.id !== updated.id);
        // Add/update in past list
        const idx = state.past.findIndex((s) => s.id === updated.id);
        if (idx !== -1) {
          state.past[idx] = updated;
        } else {
          state.past.unshift(updated);
        }
      })
      .addCase(updateMeetingUrl.fulfilled, (state, action) => {
        const updated = action.payload;
        const i1 = state.upcoming.findIndex((s) => s.id === updated.id);
        if (i1 !== -1) state.upcoming[i1] = updated;
        const i2 = state.past.findIndex((s) => s.id === updated.id);
        if (i2 !== -1) state.past[i2] = updated;
      })
  },
});

export const { clearError } = sessionsSlice.actions;
export default sessionsSlice.reducer;
