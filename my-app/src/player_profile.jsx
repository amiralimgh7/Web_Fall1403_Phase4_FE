import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import "./profile.css";

const PlayerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");

    if (!username) {
      setError("نام کاربری پیدا نشد. لطفاً وارد شوید.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/user-profile?username=${username}`);
        if (response.ok) {
          const result = await response.json();
          if (result.responseHeader === "OK") {
            setProfile(result.dto);
          } else {
            setError("خطایی در دریافت اطلاعات پروفایل رخ داده است.");
          }
        } else {
          setError("خطا در برقراری ارتباط با سرور.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("خطا در برقراری ارتباط با سرور.");
      }
    };

    fetchProfile();
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

      {/* دکمه تغییر حالت تاریک */}
      <button id="dark-mode-toggle" className="dark-mode-btn" onClick={handleToggleDarkMode}>
        <span id="icon">🌞</span>
      </button>

      {/* محتوای پروفایل */}
      <div className="profile-box">
        {error ? (
          <p className="error-message">{error}</p>
        ) : profile ? (
          <>
            <img
              src={require("./pictures/image.png")}
              alt="پروفایل بازیکن"
              className="profile-img"
            />
            <h2>پروفایل بازیکن</h2>
            <p>نام: {profile.username}</p>
            <p>امتیاز کل: {profile.score}</p>
            <p>رتبه: {profile.rank}</p>
            <p>بازی‌های انجام شده: {profile.gamesPlayed}</p>
            <p>برد‌ها: {profile.wins}</p>
            <p>باخت‌ها: {profile.losses}</p>
          </>
        ) : (
          <p>در حال بارگذاری...</p>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
