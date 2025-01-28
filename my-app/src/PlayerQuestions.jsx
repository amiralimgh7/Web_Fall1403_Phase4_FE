import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import "./player_questions.css";

const PlayerQuestions = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [categories, setCategories] = useState([]); // Categories from API
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // از حافظه می‌خوانیم
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("userToken");

  // اگر نام کاربری یا توکن در حافظه نیست، توصیه می‌شود جداگانه چک کنید

  /**
   * گرفتن سؤال‌های پاسخ‌داده‌شده توسط کاربر
   */
  const fetchUserQuestions = async () => {
    if (!username) {
      alert("نام کاربری در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }
    if (!token) {
      alert("توکن در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/question-by-user?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      console.log("Fetched Questions by User:", result);

      if (response.ok && result.responseHeader === "OK") {
        const formattedQuestions = result.dto.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: [q.answer1, q.answer2, q.answer3, q.answer4],
          category: q.category,
        }));

        setAnsweredQuestions(formattedQuestions);
      } else {
        alert("خطا در دریافت سوالات پاسخ داده شده.");
      }
    } catch (err) {
      console.error("Error fetching user questions:", err);
      alert("خطا در ارتباط با سرور.");
    }
  };

  /**
   * گرفتن فهرست دسته‌بندی‌ها
   */
  const fetchCategories = async () => {
    if (!token) {
      alert("توکن در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.responseHeader === "OK") {
        setCategories(result.dto.categories);
      } else {
        console.error("Failed to fetch categories.");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  /**
   * گرفتن سؤال تصادفی
   */
  const getRandomQuestion = async () => {
    if (!token) {
      alert("توکن در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/one-random-question", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.responseHeader === "OK") {
        const q = result.dto;
        setCurrentQuestion({
          id: q.id,
          question: q.question,
          options: [q.answer1, q.answer2, q.answer3, q.answer4],
          correct: q.correctAnswer,
          category: q.category,
        });
      } else {
        console.error("Failed to fetch random question.");
      }
    } catch (err) {
      console.error("Error fetching random question:", err);
    }
  };

  /**
   * گرفتن سؤال بر اساس دسته‌بندی
   */
  const getCategoryQuestion = async () => {
    if (!selectedCategory) {
      alert("لطفاً یک دسته‌بندی انتخاب کنید.");
      return;
    }
    if (!token) {
      alert("توکن در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/one-random-question-by-category?categoryName=${selectedCategory}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.responseHeader === "OK") {
        const q = result.dto;
        setCurrentQuestion({
          id: q.id,
          question: q.question,
          options: [q.answer1, q.answer2, q.answer3, q.answer4],
          correct: q.correctAnswer,
          category: q.category,
        });
      } else {
        console.error("Failed to fetch question by category.");
      }
    } catch (err) {
      console.error("Error fetching question by category:", err);
    }
  };

  /**
   * گرفتن همهٔ سؤالات (اختیاری)
   */
  const fetchAllQuestions = async () => {
    if (!token) {
      alert("توکن در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/question-set", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.responseHeader === "OK") {
        console.log("All questions:", result.dto.questions);
      } else {
        console.error("Failed to fetch questions.");
      }
    } catch (err) {
      console.error("Error fetching all questions:", err);
    }
  };

  /**
   * پاسخ به سؤال جاری
   */
  const handleAnswer = async (selectedOption) => {
    if (!currentQuestion) return;

    if (!token) {
      alert("توکن در حافظه یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      // ارسال درخواست با متد POST
      const response = await fetch("http://localhost:8080/answer-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({
          username: username,
          questionId: currentQuestion.id,
          answer: selectedOption,
        }).toString(),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok && result.responseHeader === "OK") {
        const correctAnswer = result.dto.value;
        if (correctAnswer === selectedOption) {
          alert("پاسخ صحیح است!");
        } else {
          alert(`پاسخ اشتباه است! پاسخ صحیح گزینه ${correctAnswer} است.`);
        }

        // افزودن این سؤال به answeredQuestions (بدون بررسی)
        setAnsweredQuestions((prev) => [
          ...prev,
          { ...currentQuestion, userAnswer: selectedOption },
        ]);
      } else {
        console.error("Unexpected API response:", result);
        alert("خطایی در بررسی پاسخ رخ داده است.");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("خطا در ارتباط با سرور.");
    }

    // پاک کردن سؤال جاری
    setCurrentQuestion(null);
  };

  /**
   * تریگر شدن فقط یک بار در mount
   */
  useEffect(() => {
    // گرفتن دسته‌بندی‌ها و همه سوال‌ها فقط هنگام load
    fetchCategories();
    fetchAllQuestions();
  }, []);

  /**
   * تریگر شدن رندر/تغییر darkMode
   */
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  /**
   * گرفتن سؤال‌های پاسخ داده شده
   */
  useEffect(() => {
    fetchUserQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main-container">
      <NavbarPlayer />

      <button
        id="dark-mode-toggle"
        className="dark-mode-btn"
        onClick={() => setDarkMode(!darkMode)}
      >
        <span id="icon">{darkMode ? "🌜" : "🌞"}</span>
      </button>

      <div className="question-box">
        <h2>پاسخ به سوالات</h2>

        <div className="select-question-method">
          <label htmlFor="category">انتخاب دسته‌بندی سوال:</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((category, index) => (
              <option key={index} value={category.category_name}>
                {category.category_name}
              </option>
            ))}
          </select>

          <button
            id="category-question-btn"
            className="btn-primary"
            onClick={getCategoryQuestion}
          >
            دریافت سوال از دسته‌بندی
          </button>
          <button
            id="random-question-btn"
            className="btn-secondary"
            onClick={getRandomQuestion}
          >
            دریافت سوال تصادفی
          </button>
        </div>

        {currentQuestion && (
          <div id="random-question-box" className="question-box">
            <h3>سوال: {currentQuestion.question}</h3>
            <p>دسته‌بندی: {currentQuestion.category}</p>
            <div className="options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className="option"
                  onClick={() => handleAnswer(index + 1)}
                >
                  گزینه {index + 1}: {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="questions-container" id="questions-container">
        <h2>سوالات پاسخ داده شده</h2>
        {answeredQuestions.map((answered, index) => (
          <div key={index} className="question-item">
            <h3>سوال: {answered.question}</h3>
            <div className="options">
              {answered.options.map((option, i) => (
                <p key={i}>
                  گزینه {i + 1}: {option}
                </p>
              ))}
            </div>
            <p>دسته‌بندی: {answered.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerQuestions;
