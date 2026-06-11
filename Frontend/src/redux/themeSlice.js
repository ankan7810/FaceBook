import { createSlice } from "@reduxjs/toolkit";

// ✅ Load theme from localStorage
const savedTheme = localStorage.getItem("theme") || "light";

const initialState = {
  theme: savedTheme,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,

  reducers: {
    toggleTheme: (state) => {
      state.theme =
        state.theme === "light" ? "dark" : "light";

      // ✅ Persist theme
      localStorage.setItem("theme", state.theme);

      // ✅ Apply class instantly
      if (state.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;