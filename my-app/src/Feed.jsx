import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import "./Feed.css";
import axios from "axios";

const Feed = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  // شناسه و نام کاربری کاربر فعلی
  const currentUserId = localStorage.getItem("currentUserId"); 
  const username = localStorage.getItem("username");

  // توکن را از localStorage می‌خوانیم
  const token = localStorage.getItem("userToken");

  /**
   * گرفتن سؤالات فید از سرور
   */
  const fetchFeedQuestions = async () => {
    // اگر توکن یا نام کاربری موجود نباشد، خطا می‌دهیم
    if (!token) {
      setError("توکن یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }
    if (!username) {
      setError("نام کاربری یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      // ارسال درخواست به سرور با هدر Authorization
      const response = await axios.get(
        `http://localhost:8080/feed?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // بررسی فیلد responseHeader
      if (response.data.responseHeader === "OK") {
        const rawQuestions = response.data.dto.questions || [];
        // فرمت‌دهی داده‌ها
        const newQuestions = rawQuestions.map((q) => ({
          id: q.id,
          text: q.question,
          options: [q.answer1, q.answer2, q.answer3, q.answer4],
          correctAnswer: q.correctAnswer, // مثلاً "2"
          category: q.category,
          difficulty: q.hardness, // مثلاً "1", "2", "3"
        }));

        setQuestions(newQuestions);
        setError("");
      } else {
        setError("خطا در دریافت سوالات از فید.");
      }
    } catch (err) {
      console.error("Error fetching feed questions:", err);
      setError("خطا در برقراری ارتباط با سرور.");
    }
  };

  /**
   * تابع ارسال پاسخ سؤال
   */
  const handleAnswer = async (questionId, selectedOption) => {
    if (!token) {
      alert("توکن یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }
    if (!username) {
      alert("نام کاربری یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      // مثال: POST /answer-question?username=...&questionId=...&answer=...
      const response = await axios.post(
        "http://localhost:8080/answer-question",
        null, // بدنه خالی
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            username: username,
            questionId: questionId,
            answer: selectedOption,
          },
        }
      );

      if (response.data.responseHeader === "OK") {
        const correctAnswer = response.data.dto.value; // پاسخ درست
        if (+correctAnswer === selectedOption) {
          alert("پاسخ صحیح است! امتیاز شما افزایش یافت.");
        } else {
          alert(`اشتباه است! گزینه صحیح ${correctAnswer} می‌باشد.`);
        }
      } else {
        alert("خطا در ارسال پاسخ.");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("خطا در ارسال پاسخ به سرور.");
    }
  };

  /**
   * در بارگذاری اولیه صفحه، سؤالات فید را می‌گیریم
   */
  useEffect(() => {
    fetchFeedQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * تابع تغییر حالت تاریک
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

      <div className="feed-container">
        <h2>فید سوالات</h2>
        {error && <p className="error-message">{error}</p>}

        {questions.map((question, index) => (
          <div key={index} className="question-item">
            <h3>متن سوال: {question.text}</h3>

            {/* نمایش گزینه‌ها */}
            <div className="options">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  className="option-btn"
                  onClick={() => handleAnswer(question.id, i + 1)}
                >
                  گزینه {i + 1}: {option}
                </button>
              ))}
            </div>

            <p>دسته‌بندی: {question.category}</p>
            <p>درجه دشواری: {question.difficulty}</p>
          </div>
        ))}

        {/* اگر هیچ سوالی نداشتیم و خطایی هم نبود */}
        {questions.length === 0 && !error && (
          <p>هیچ سوالی برای نمایش وجود ندارد.</p>
        )}
      </div>
    </div>
  );
};

export default Feed;
