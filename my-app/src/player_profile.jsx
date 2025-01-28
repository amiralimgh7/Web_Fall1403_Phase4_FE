import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import "./profile.css";

/**
 * PlayerProfile: پس از لاگین موفق، این صفحه پروفایل کاربر را (با نام کاربری و توکن) از سرور می‌گیرد.
 */
const PlayerProfile = () => {
  const [profile, setProfile] = useState(null); // اطلاعات پروفایل
  const [error, setError] = useState("");       // پیام خطا (در صورت بروز مشکل)

  useEffect(() => {
    console.log("[PlayerProfile] useEffect triggered.");

    // گرفتن نام کاربری و توکن از localStorage
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("userToken");

    console.log("[PlayerProfile] LocalStorage => username:", username, ", token:", token);

    // ۱) اگر username موجود نبود
    if (!username) {
      setError("نام کاربری یافت نشد. لطفاً ابتدا وارد شوید.");
      console.log("[PlayerProfile] نام کاربری یافت نشد => setError");
      return;
    }

    // ۲) اگر توکن در localStorage نبود
    if (!token) {
      setError("توکن یافت نشد. لطفاً ابتدا وارد شوید.");
      console.log("[PlayerProfile] توکن یافت نشد => setError");
      return;
    }

    // ۳) درخواست از سرور برای گرفتن پروفایل
    const fetchProfile = async () => {
      console.log("[PlayerProfile] Starting fetchProfile => username:", username, ", token:", token);

      try {
        const response = await fetch(`http://localhost:8080/user-profile?username=${username}`, {
          method: "GET",
          headers: {
            // هدر Authorization با فرمت Bearer
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log("[PlayerProfile] Response status:", response.status, ", ok:", response.ok);

        // اگر پاسخ بین 200 تا 299 نباشد، یعنی مشکل در ارتباط
        if (!response.ok) {
          setError("خطا در برقراری ارتباط با سرور.");
          console.log("[PlayerProfile] response.ok was false => setError");
          return;
        }

        // تجزیه پاسخ به JSON
        const result = await response.json();
        console.log("[PlayerProfile] result from server:", result);

        // بررسی فیلد responseHeader
        if (result.responseHeader === "OK") {
          console.log("[PlayerProfile] Server responded OK => setting profile to:", result.dto);
          setProfile(result.dto); // dto پروفایل را در state ذخیره می‌کنیم
        } else {
          setError("خطایی در دریافت اطلاعات پروفایل رخ داده است.");
          console.log("[PlayerProfile] Server responded but not OK => setError");
        }
      } catch (err) {
        console.error("[PlayerProfile] Caught error in fetchProfile:", err);
        setError("خطا در برقراری ارتباط با سرور.");
      }
    };

    // فراخوانی تابع
    fetchProfile();
  }, []); // فقط یک بار هنگام mount

  // تابع کمکی برای تغییر حالت تاریک
  const handleToggleDarkMode = () => {
    const icon = document.getElementById("icon");
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      if (icon) icon.textContent = "🌞";
      console.log("[PlayerProfile] Toggled OFF dark-mode.");
    } else {
      document.body.classList.add("dark-mode");
      if (icon) icon.textContent = "🌜";
      console.log("[PlayerProfile] Toggled ON dark-mode.");
    }
  };

  return (
    <div className="main-container">
      {/* نوار بالای بازیکن */}
      <NavbarPlayer />

      {/* دکمه تغییر حالت تاریک */}
      <button
        id="dark-mode-toggle"
        className="dark-mode-btn"
        onClick={handleToggleDarkMode}
      >
        <span id="icon">🌞</span>
      </button>

      {/* باکس پروفایل */}
      <div className="profile-box">
        {error ? (
          // اگر خطایی رخ داده باشد
          <p className="error-message">{error}</p>
        ) : profile ? (
          // در صورت موفقیت، نمایش اطلاعات
          <>
            <img
              src={require("./pictures/image.png")}
              alt="پروفایل بازیکن"
              className="profile-img"
            />
            <h2>پروفایل بازیکن</h2>
            <p>نام: {profile.username}</p>
            <p>امتیاز کل: {profile.score}</p>
            <p>سوالات پاسخ‌داده‌شده: {profile.question_count}</p>
            {/* <p> فالویینگ ها : {profile.pfollowing_count}</p>
            <p>فالور ها: {profile.follower_count}</p> */}
       
          </>
        ) : (
          // حالت بارگذاری اولیه
          <p>در حال بارگذاری...</p>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
