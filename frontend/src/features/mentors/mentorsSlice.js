import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

export const fetchMentors = createAsyncThunk(
  'mentors/fetchMentors',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      
      const response = await axiosInstance.get(`mentors/?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch mentors');
    }
  }
);

export const fetchMentorById = createAsyncThunk(
  'mentors/fetchMentorById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`mentors/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch mentor');
    }
  }
);

const initialState = {
  list: [],
  currentMentor: null,
  loading: false,
  error: null,
  filters: {
    skill: '',
    search: '',
    page: 1,
  },
};

const mentorsSlice = createSlice({
  name: 'mentors',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMentors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.results || action.payload;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMentorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMentorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMentor = action.payload;
      })
      .addCase(fetchMentorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = mentorsSlice.actions;
export default mentorsSlice.reducer;
