import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

const NavbarPlayer = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  return (
    <nav className="menu">
      <div className="menu-section">
        <Link to="/player/profile/main" id="profile-link">
          پروفایل
        </Link>
        <span className="material-icons">person</span>
      </div>
      <div className="menu-section">
        <Link to="/player/questions" id="questions-link">
          سوالات
          <span className="material-icons">help</span>
        </Link>
      </div>
       <div className="menu-section">
       
        <Link to="/feed">فید سوالات</Link>
        <span className="material-icons">rss_feed</span>
      </div>
      <div className="menu-section">
        <Link to="/player/leaderboard" id="leaderboard-link">
          جدول امتیازات
        
          <span className="material-icons">emoji_events</span>
        </Link>
      </div>
   
      <div className="menu-section">
        <Link to="/player/search" id="search-link">
          جستجو
        </Link>
        <span className="material-icons">search</span>
      </div>
      <div className="menu-section logout">
        <button onClick={handleLogout} id="logout-button">
          خروج
          <span className="material-icons">logout</span>
        </button>
        
      </div>
    </nav>
  );
};

export default NavbarPlayer;
