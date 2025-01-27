import React, { useEffect } from "react";
import NavbarPlayer from "./components/NavbarPlayer.jsx"; // مسیر صحیح به NavbarPlayer
import "./designer.css";

const Player = () => {
  useEffect(() => {
    document.body.classList.remove("dark-mode");
  }, []);

  const handleToggleDarkMode = () => {
    const icon = document.getElementById("icon");
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      if (icon) icon.textContent = "🌞";
    } else {
      document.body.classList.add("dark-mode");
      if (icon) icon.textContent = "🌜";
    }
  };

  return (
    <div className="main-container">
      {/* استفاده از NavbarPlayer */}
      <NavbarPlayer />
      <div className="content"></div>
      <button id="dark-mode-toggle" className="dark-mode-btn" onClick={handleToggleDarkMode}>
        <span id="icon">🌞</span>
      </button>
    </div>
  );
};

export default Player;
