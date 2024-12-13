import React, { useState, useEffect } from "react";
import "./ThemeToggle.css";

const LIGHT_THEME = "light";
const DARK_THEME = "dark";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then fallback to dark theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === LIGHT_THEME || savedTheme === DARK_THEME)
    {
      return savedTheme;
    }
    return DARK_THEME;
  });

  useEffect(() => {
    // Update document root with theme
    document.documentElement.setAttribute('color-theme', theme);
    localStorage.setItem('theme', theme); // Save to localStorage
  }, [theme]);

  const handleThemeChange = () => {
    setTheme(prevTheme => 
      prevTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME
    );
  };

  return (
    <div className="theme-toggle-container">
      <button 
        className="theme-toggle" 
        onClick={handleThemeChange}
        aria-label={`Switch to ${theme === LIGHT_THEME ? 'dark' : 'light'} mode`}
      >
        {theme === DARK_THEME ? "🌙" : "☀️"}
      </button>
    </div>
  );
};

export default ThemeToggle;
