import React, { useEffect, useState } from "react";
import "./signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "PLAYER",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.body.classList.remove("dark-mode");
  }, []);

  const handleToggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
  
    const { username, password, confirmPassword, role } = formData;
  
    if (password !== confirmPassword) {
      setError("رمز عبور و تأیید رمز عبور یکسان نیستند.");
      return;
    }
  
    try {
      const formData = new URLSearchParams({
        username: username,
        password: password,
        personType: role,
      }).toString();
  
      const response = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });
  
      const result = await response.json();
  
      if (response.ok && result.responseHeader === "OK") {
        setSuccess("ثبت‌نام با موفقیت انجام شد!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError("خطایی رخ داده است. لطفاً دوباره تلاش کنید.");
      }
    } catch (error) {
      console.error("Error details:", error);
      setError("خطایی در ارتباط با سرور رخ داده است.");
    }
  };
  
  

  return (
    <div className="main-container">
      <div className="signup-box">
        <h2>ثبت‌نام در سامانه سوال پیچ</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form id="signupForm" onSubmit={handleFormSubmit}>
          <div className="input-group">
            {/* <label htmlFor="email">ایمیل:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            */}
          </div>
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
            <label htmlFor="confirmPassword">تأیید رمز عبور:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
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
              <option value="PLAYER">بازیکن</option>
              <option value="DESIGNER">طراح سوال</option>
            </select>
          </div>
          <button type="submit" className="submit-btn">
            ثبت‌نام
          </button>
        </form>
        <div className="login-link">
          <p>
            حساب کاربری دارید؟ <a href="/login">وارد شوید</a>
          </p>
        </div>
        <button
          id="dark-mode-toggle"
          className="dark-mode-btn"
          onClick={handleToggleDarkMode}
        >
          <span id="icon">🌞</span>
        </button>
      </div>
    </div>
  );
};

export default Signup;
