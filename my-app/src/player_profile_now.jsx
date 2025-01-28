import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer"; 
import "./profile.css";

const DesignerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("userToken"); // اضافه شد

    // اگر username و token نباشد، خطا بدهیم
    if (!username) {
      setError("نام کاربری پیدا نشد. لطفاً وارد شوید.");
      return;
    }
    if (!token) {
      setError("توکن یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    const fetchProfile = async () => {
      try {
        // ارسال درخواست با هدر Authorization
        const response = await fetch(
          `http://localhost:8080/user-profile?username=${username}`, 
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.responseHeader === "OK") {
            setProfile(result.dto);
          } else {
            setError("خطایی در دریافت اطلاعات پروفایل رخ داده است.");
          }
        } else {
          setError(`خطا در برقراری ارتباط با سرور. (status: ${response.status})`);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("خطا در برقراری ارتباط با سرور.");
      }
    };

    fetchProfile();
  }, []);

  const handleToggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className="main-container">
      <NavbarPlayer />

      <button 
        id="dark-mode-toggle" 
        className="dark-mode-btn" 
        onClick={handleToggleDarkMode}
      >
        <span id="icon">🌞</span>
      </button>

      <div className="profile-box">
        {error ? (
          <p className="error-message">{error}</p>
        ) : profile ? (
          <>
            <img
              src={require("./pictures/image.png")}
              alt="پروفایل"
              className="profile-img"
            />
            <h2>پروفایل طراح</h2>
            <p>نام کاربری: {profile.username}</p>
            <p>تعداد دنبال‌کنندگان: {profile.follower_count}</p>
            <p>تعداد سوالات طراحی‌شده: {profile.question_count}</p>
            <p>امتیاز کل: {profile.score}</p>
          </>
        ) : (
          <p>در حال بارگذاری...</p>
        )}
      </div>
    </div>
  );
};

export default DesignerProfile;
