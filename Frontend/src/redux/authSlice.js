import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // 🔄 START LOADING
    setLoading: (state, action) => {
      state.loading = action.payload ?? true;
    },

    // ✅ SET USER (login / refresh)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    // 🔄 UPDATE USER (IMPORTANT 🔥)
    updateUser: (state, action) => {
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    // 🚪 LOGOUT
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    // ❌ ERROR
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // 🧹 CLEAR ERROR
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  updateUser,     // 🔥 NEW (important)
  logoutUser,
  setLoading,
  setError,
  clearError,     // 🔥 NEW
} = authSlice.actions;

export default authSlice.reducer;