import React, { useState, useEffect } from "react";
import NavbarPlayer from "./components/NavbarPlayer"; // یا مسیر درست فایل NavbarPlayer
import axios from "axios";
import "./profile.css";

const PlayerSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedProfile, setSearchedProfile] = useState(null);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // از localStorage می‌خوانیم:
  const username = localStorage.getItem("username");   // نام کاربری لاگین‌شده
  const token = localStorage.getItem("userToken");     // توکن JWT
  // نکته: اگر مطمئنید که همواره وجود دارد، می‌توانید بدون چک‌کردن آن را استفاده کنید.

  useEffect(() => {
    // در اینجا شناسهٔ کاربر را که قبلا در لاگین در localStorage ذخیره شده بود، می‌خوانیم:
    const storedId = localStorage.getItem("currentUserId");
    if (storedId) {
      setCurrentUserId(parseInt(storedId, 10));
    }
  }, []);

  /**
   * ۱) جستجو بر اساس نام کاربری:
   * GET /user-profile/search?username=...
   * => نیازمند هدر Authorization: Bearer {token}
   */
  const handleSearchClick = async () => {
    if (!searchTerm.trim()) {
      setError("لطفاً یک نام کاربری وارد کنید.");
      setSearchedProfile(null);
      return;
    }

    // فرض می‌کنیم کاربر لاگین کرده و token دارد:
    setError("");
    setSearchedProfile(null);

    try {
      const response = await fetch(
        `http://localhost:8080/user-profile/search?username=${searchTerm}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // لازم برای احراز هویت
          },
        }
      );

      if (!response.ok) {
        setError(`خطا در ارتباط با سرور (status: ${response.status}).`);
        return;
      }

      const result = await response.json();
      if (result.responseHeader === "OK") {
        setSearchedProfile(result.dto);
        setError("");
      } else if (result.responseHeader === "USERNAME_NOT_EXISTS") {
        setError("کاربری با این نام کاربری یافت نشد.");
      } else {
        setError("خطا در جستجوی کاربر.");
      }
    } catch (err) {
      console.error("Error searching user profile:", err);
      setError("خطا در ارتباط با سرور.");
    }
  };

  /**
   * ۲) تابع دنبال‌کردن:
   * POST /follow-action?followerId=...&targetUserId=...
   * در هدر Authorization نیز توکن می‌گذاریم
   */
  const handleFollow = async (targetUserId) => {
    try {
      // مثال: چون مطمئن هستید لاگین کردید، دیگر alert نمی‌دهیم
      const response = await axios.post(
        "http://localhost:8080/follow-action",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`, // توکن
          },
          params: { followerId: currentUserId, targetUserId },
        }
      );

      const { responseHeader } = response.data;
      if (responseHeader === "OK") {
        alert("دنبال کردن کاربر با موفقیت انجام شد.");
        // برای به‌روزشدن داده:
        handleSearchClick();
      } else if (responseHeader === "ALREADY_FOLLOWING") {
        alert("شما قبلاً این کاربر را دنبال کرده‌اید!");
      } else {
        alert(`خطا در دنبال کردن کاربر: ${responseHeader}`);
      }
    } catch (err) {
      console.error("Error following user:", err.response?.data || err.message);
      alert("خطا در دنبال کردن کاربر. لطفاً دوباره تلاش کنید.");
    }
  };

  /**
   * ۳) تابع لغو دنبال‌کردن:
   * POST /unfollow-action?followerId=...&targetUserId=...
   */
  const handleUnfollow = async (targetUserId) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/unfollow-action",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            params: { followerId: currentUserId, targetUserId },
          },
        }
      );

      const { responseHeader } = response.data;
      if (responseHeader === "OK") {
        alert("لغو دنبال کردن کاربر با موفقیت انجام شد.");
        handleSearchClick();
      } else if (responseHeader === "NOT_FOLLOWING") {
        alert("شما این کاربر را دنبال نکرده‌اید!");
      } else {
        alert(`خطا در لغو دنبال کردن کاربر: ${responseHeader}`);
      }
    } catch (err) {
      console.error("Error unfollowing user:", err.response?.data || err.message);
      alert("خطا در لغو دنبال کردن کاربر. لطفاً دوباره تلاش کنید.");
    }
  };

  // دکمه Dark Mode
  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className="main-container">
      <NavbarPlayer />

      <button
        id="dark-mode-toggle"
        className="dark-mode-btn"
        onClick={toggleDarkMode}
      >
        <span id="icon">🌞</span>
      </button>

      <div className="profile-box">
        <input
          type="text"
          placeholder="نام کاربری فرد مورد نظر..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearchClick} className="search-button">
          جستجو
        </button>

        {error && <p className="error-message">{error}</p>}

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

            {/* اگر کاربر خودتان نباشد، دکمه‌های Follow/Unfollow نشان می‌دهیم */}
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
