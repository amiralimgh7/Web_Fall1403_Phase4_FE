import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import "./player_leaderboard.css";
import axios from "axios";

/**
 * صفحهٔ نمایش جدول امتیازات + امکان دنبال‌کردن و لغو دنبال‌کردن کاربر.
 */
const PlayerLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]); // داده‌های جدول امتیازات
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // نام کاربری جاری و توکنی که در localStorage ذخیره شده
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("userToken");

  /**
   * تابع گرفتن فهرست امتیازات
   */
  const fetchLeaderboard = async () => {
    try {
      // فراخوانی سرور با هدر Authorization
      const response = await axios.get("http://localhost:8080/get-score-board", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profiles = response.data.dto?.profiles || [];
      console.log("Leaderboard profiles:", profiles);

      setLeaderboardData(profiles);

      // پیدا کردن کاربر فعلی در بین لیست برای ذخیره‌ی currentUserId
      const localUsername = localStorage.getItem("username");
      const currentUser = profiles.find((profile) => profile.username === localUsername);
      if (currentUser) {
        setCurrentUserId(currentUser.id);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("خطا در دریافت اطلاعات جدول امتیازات: " + (err.message || err));
    }
  };

  /**
   * تابع دنبال کردن (Follow)
   */
  const handleFollow = async (targetUserId) => {
    if (!currentUserId || !targetUserId) {
      console.error("Invalid IDs: currentUserId or targetUserId is missing.");
      alert("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/follow-action",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            followerId: currentUserId,
            targetUserId,
          },
        }
      );

      const { responseHeader } = response.data;
      if (responseHeader === "OK") {
        alert("دنبال کردن کاربر با موفقیت انجام شد.");
      } else if (responseHeader === "ALREADY_FOLLOWING") {
        alert("شما قبلاً این کاربر را دنبال کرده‌اید!");
      } else {
        alert("خطا در دنبال کردن کاربر: " + responseHeader);
      }
      // دوباره دریافت فهرست تا به‌روز شود
      fetchLeaderboard();
    } catch (err) {
      console.error("Error following user:", err.response?.data || err.message);
      alert("خطا در دنبال کردن کاربر. لطفاً دوباره تلاش کنید.");
    }
  };

  /**
   * تابع لغو دنبال کردن (Unfollow)
   */
  const handleUnfollow = async (targetUserId) => {
    if (!currentUserId || !targetUserId) {
      console.error("Invalid IDs: currentUserId or targetUserId is missing.");
      alert("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/unfollow-action",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            followerId: currentUserId,
            targetUserId,
          },
        }
      );
      const { responseHeader } = response.data;

      if (responseHeader === "OK") {
        alert("لغو دنبال کردن کاربر با موفقیت انجام شد.");
      } else if (responseHeader === "NOT_FOLLOWING") {
        alert("شما این کاربر را دنبال نکرده‌اید!");
      } else {
        alert("خطا در لغو دنبال کردن کاربر: " + responseHeader);
      }
      // به‌روزرسانی فهرست
      fetchLeaderboard();
    } catch (err) {
      console.error("Error unfollowing user:", err.response?.data || err.message);
      alert("خطا در لغو دنبال کردن کاربر. لطفاً دوباره تلاش کنید.");
    }
  };

  /**
   * در بارگذاری اولیه کامپوننت، fetchLeaderboard را صدا می‌زنیم.
   */
  useEffect(() => {
    if (!username) {
      setError("نام کاربری در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }
    if (!token) {
      setError("توکن در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }
    fetchLeaderboard();
  }, []);

  /**
   * تابع تغییر حالت تاریک/روشن
   */
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

      <div className="leaderboard">
        <h2>جدول امتیازات</h2>
        {error && <p className="error-message">{error}</p>}

        <table>
          <thead>
            <tr>
              <th>رتبه</th>
              <th>نام کاربری</th>
              <th>امتیاز</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.username}</td>
                <td>{player.score}</td>
                <td>
                  {/* اگر این کاربر، کاربر جاری نباشد دکمه‌های دنبال/لغو نشان دهیم */}
                  {player.id !== currentUserId && (
                    <>
                      <button
                        className="follow-btn"
                        onClick={() => handleFollow(player.id)}
                      >
                        دنبال کردن
                      </button>
                      <button
                        className="unfollow-btn"
                        onClick={() => handleUnfollow(player.id)}
                      >
                        لغو دنبال کردن
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {leaderboardData.length === 0 && (
              <tr>
                <td colSpan="4">هیچ اطلاعاتی برای نمایش وجود ندارد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerLeaderboard;
