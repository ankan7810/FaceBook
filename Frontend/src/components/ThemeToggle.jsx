import { useEffect, useState } from "react";

const ThemeToggle = () => {
  // ✅ Load saved theme immediately
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // ✅ Apply theme whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((prev) => !prev)}
      className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white cursor-pointer transition-all duration-300"
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;