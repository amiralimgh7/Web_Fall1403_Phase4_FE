import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import "./player_leaderboard.css";
import axios from "axios"; // For API requests

const PlayerLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]); // Leaderboard data
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const username = localStorage.getItem("username");

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get("http://localhost:8080/get-score-board");
      const profiles = response.data.dto.profiles || []; // Assuming response format
      console.log(profiles)
      setLeaderboardData(profiles);
      const localUsername = localStorage.getItem("username");
      const currentUser = profiles.find(
        (profile) => profile.username === localUsername
      );
      if (currentUser) {
        setCurrentUserId(currentUser.id);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("خطا در دریافت اطلاعات جدول امتیازات.");
    }
  };

  // Follow User API Call
// Follow User API Call
const handleFollow = async (targetUserId) => {
  if (!currentUserId || !targetUserId) {
    console.error("Invalid IDs: currentUserId or targetUserId is missing.");
    alert("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:8080/follow-action", null, {
      params: { followerId: currentUserId, targetUserId },
    });

    const { responseHeader, dto } = response.data;
    
    if (responseHeader === "OK") {
      alert("دنبال کردن کاربر با موفقیت انجام شد.");
    } else if (responseHeader === "ALREADY_FOLLOWING") {
      alert("شما قبلاً این کاربر را دنبال کرده‌اید!");
    } else {
      alert("خطا در دنبال کردن کاربر: " + responseHeader);
    }
    fetchLeaderboard(); // Refresh leaderboard data
  } catch (err) {
    console.error("Error following user:", err.response?.data || err.message);
    alert("خطا در دنبال کردن کاربر. لطفاً دوباره تلاش کنید.");
  }
};

// Unfollow User API Call
const handleUnfollow = async (targetUserId) => {
  if (!currentUserId || !targetUserId) {
    console.error("Invalid IDs: currentUserId or targetUserId is missing.");
    alert("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
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
      alert("خطا در لغو دنبال کردن کاربر: " + responseHeader);
    }
    alert("لغو دنبال کردن کاربر با موفقیت انجام شد.");
    fetchLeaderboard(); // Refresh leaderboard data
  } catch (err) {
    console.error("Error unfollowing user:", err.response?.data || err.message);
    alert("خطا در لغو دنبال کردن کاربر. لطفاً دوباره تلاش کنید.");
  }
};


  // Fetch leaderboard data on component mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="main-container">
      {/* Navbar */}
      <NavbarPlayer />

      {/* Dark Mode Toggle */}
      <button
        id="dark-mode-toggle"
        className="dark-mode-btn"
        onClick={() => document.body.classList.toggle("dark-mode")}
      >
        <span id="icon">🌞</span>
      </button>

      {/* Leaderboard */}
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
        {/* Do not show follow/unfollow buttons for the current user */}
        { player.id != currentUserId && (
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
