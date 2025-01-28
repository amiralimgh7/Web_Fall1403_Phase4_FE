import React, { useEffect, useState } from "react";
import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "player",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.body.classList.remove("dark-mode");
  }, []);

  // تابعی که تغییرات ورودی‌های فرم را می‌گیرد
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // تابعی که روی دکمه «ورود» فراخوانی می‌شود
  const handleLogin = async (event) => {
    event.preventDefault();
    
    setError("");
    setSuccess("");

    const { username, password, role } = formData;

    // اگر می‌خواهید صرفاً با کلیک روی دکمه ورود، username را در LocalStorage بگذارید:
    localStorage.setItem("username", username);

    // کد ارسال درخواست به سرور...
    try {
      const formBody = new URLSearchParams({
        username: username,
        password: password,
        personType: role.toUpperCase(),
      }).toString();

      const response = await fetch("http://localhost:8080/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });

      const result = await response.json();

      if (response.ok && result.responseHeader === "OK") {
        setSuccess("ورود با موفقیت انجام شد!");

        // پاسخ سرور را تحلیل می‌کنید
        const personDto = result.dto;

        // فرضاً آیدی کاربر هم نگه می‌دارید
        localStorage.setItem("currentUserId", result.dto.data.id);
        localStorage.setItem("userToken",  result.dto.data.token);

        

        // هدایت به صفحه بعد
        if (role === "player") {
          window.location.href = "/player";
        } else {
          window.location.href = "/designer";
        }
      }
      else if (result.responseHeader === "USERNAME_NOT_EXISTS") {
        setError("نام کاربری وجود ندارد.");
      }
      else if (result.responseHeader === "WRONG_ROLE") {
        setError("نقش اشتباه است.");
      }
      else if (result.responseHeader === "WRONG_PASSWORD") {
        setError("رمز عبور اشتباه است.");
      }
      else {
        setError("خطایی رخ داده است. لطفاً دوباره تلاش کنید.");
      }
    } 
    catch (error) {
      console.error("Error details:", error);
      setError("خطا در برقراری ارتباط با سرور رخ داده است.");
    }
  };

  // دکمه حالت تاریک
  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className="main-container">
      <div className="login-box">
        <h2>ورود به سامانه سوال پیچ</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form id="loginForm" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">نام کاربری:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">رمز عبور:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="role">نقش خود را انتخاب کنید:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="player">بازیکن</option>
              <option value="designer">طراح سوال</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            ورود
          </button>
        </form>

        <div className="signup-link">
          <p>
            حساب کاربری ندارید؟ <a href="/signup">ثبت‌نام کنید</a>
          </p>
        </div>

        <button
          id="dark-mode-toggle"
          className="dark-mode-btn"
          onClick={toggleDarkMode}
        >
          <span id="icon">🌞</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
