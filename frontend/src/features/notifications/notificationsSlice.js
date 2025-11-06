import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  items: [], // { id, title, message, variant, timeout }
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ title, message, variant = 'success', timeout = 4000 }) {
        return {
          payload: {
            id: nanoid(),
            title,
            message,
            variant,
            timeout,
          },
        };
      },
    },
    removeNotification(state, action) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
