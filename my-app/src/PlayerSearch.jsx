import React, { useState, useEffect } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import axios from "axios"; // اگر خواستی می‌توانی از fetch استفاده کنی اما اینجا axios هست
import "./profile.css";

const PlayerSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedProfile, setSearchedProfile] = useState(null); // پروفایل نتیجه‌ی جستجو
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null); // شناسه کاربر فعلی

  useEffect(() => {
    // وقتی کامپوننت بالا می‌آید، userId لاگین‌شده را از localStorage می‌خوانیم
    const storedId = localStorage.getItem("currentUserId");
    if (storedId) {
      setCurrentUserId(parseInt(storedId));
    }
  }, []);

  // تابع جستجو: درخواست به /user-profile/search?username=...
  const handleSearchClick = async () => {
    if (!searchTerm.trim()) {
      setError("لطفاً یک نام کاربری معتبر وارد کنید.");
      setSearchedProfile(null);
      return;
    }
    setError("");
    setSearchedProfile(null);

    try {
      const response = await fetch(
        `http://localhost:8080/user-profile/search?username=${searchTerm}`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.responseHeader === "OK") {
          // نتیجه موفق؛ پروفایل کاربر را داریم
          setSearchedProfile(result.dto); // شامل id, username, followerCount, ...
          setError("");
        } else if (result.responseHeader === "USERNAME_NOT_EXISTS") {
          setError("کاربری با این نام کاربری یافت نشد.");
        } else {
          setError("خطا در جستجوی کاربر.");
        }
      } else {
        setError("خطا در ارتباط با سرور.");
      }
    } catch (err) {
      console.error("Error searching user profile:", err);
      setError("خطا در ارتباط با سرور.");
    }
  };

  // تابع دنبال کردن (Follow)
  const handleFollow = async (targetUserId) => {
    if (!currentUserId) {
      alert("ابتدا باید وارد حساب خود شده باشید!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/follow-action", null, {
        params: { followerId: currentUserId, targetUserId },
      });
      const { responseHeader } = response.data;

      if (responseHeader === "OK") {
        alert("دنبال کردن کاربر با موفقیت انجام شد.");
      } else if (responseHeader === "ALREADY_FOLLOWING") {
        alert("شما قبلاً این کاربر را دنبال کرده‌اید!");
      } else {
        alert(`خطا در دنبال کردن کاربر: ${responseHeader}`);
      }
    } catch (err) {
      console.error("Error following user:", err);
      alert("خطا در دنبال کردن کاربر. لطفاً دوباره تلاش کنید.");
    }
  };

  // تابع لغو دنبال کردن (Unfollow)
  const handleUnfollow = async (targetUserId) => {
    if (!currentUserId) {
      alert("ابتدا باید وارد حساب خود شده باشید!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/unfollow-action", null, {
        params: { followerId: currentUserId, targetUserId },
      });
      const { responseHeader } = response.data;

      if (responseHeader === "OK") {
        alert("لغو دنبال کردن کاربر با موفقیت انجام شد.");
      } else if (responseHeader === "NOT_FOLLOWING") {
        alert("شما این کاربر را دنبال نکرده‌اید!");
      } else {
        alert(`خطا در لغو دنبال کردن کاربر: ${responseHeader}`);
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
      alert("خطا در لغو دنبال کردن کاربر. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <div className="main-container">
      {/* نوار بالای بازیکن */}
      <NavbarPlayer />

      {/* دکمه حالت تاریک (Dark Mode) */}
      <button
        id="dark-mode-toggle"
        className="dark-mode-btn"
        onClick={() => document.body.classList.toggle("dark-mode")}
      >
        <span id="icon">🌞</span>
      </button>

      <div className="profile-box">
        {/* فیلد ورودی برای نام کاربری */}
        <input
          type="text"
          placeholder="نام کاربری طراح یا کاربر را وارد کنید..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearchClick} className="search-button">
          جستجو
        </button>

        {/* نمایش خطا، در صورت وجود */}
        {error && <p className="error-message">{error}</p>}

        {/* اگر نتیجه‌ای یافت شد، اطلاعات کاربر را نشان می‌دهیم */}
        {searchedProfile && (
          <div className="profile-box">
            <img
              src={require("./pictures/image.png")}
              alt="پروفایل"
              className="profile-img"
            />
            <h2>پروفایل کاربر</h2>
            <p>نام کاربری: {searchedProfile.username}</p>
            <p>تعداد دنبال‌کنندگان: {searchedProfile.follower_count}</p>
            <p>تعداد دنبال‌شده‌ها: {searchedProfile.following_count}</p>
            <p>تعداد سوالات طراحی‌شده: {searchedProfile.question_count}</p>
            <p>تعداد سوالات پاسخ‌داده‌شده: {searchedProfile.answered_count}</p>
            <p>امتیاز کل: {searchedProfile.score}</p>

            {/* دکمه‌های follow/unfollow در صورتیکه کاربر جاری با کاربر جستجو شده متفاوت باشد */}
            {searchedProfile.id !== currentUserId && (
              <div style={{ marginTop: "10px" }}>
                <button
                  style={{ marginRight: "10px" }}
                  onClick={() => handleFollow(searchedProfile.id)}
                >
                  دنبال کردن
                </button>
                <button onClick={() => handleUnfollow(searchedProfile.id)}>
                  لغو دنبال کردن
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSearch;
