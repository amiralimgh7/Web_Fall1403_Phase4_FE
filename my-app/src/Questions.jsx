import React, { useState, useEffect } from "react";
import DesignerNavbar from "./components/DesignerNavbar"; // Navbar component
import "./questions.css"; // Styles for the questions page

const Questions = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [questions, setQuestions] = useState([]); // Questions fetched from the API
  const [categories, setCategories] = useState([]); // Categories fetched from the API
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correct: "1",
    category: "", // بعداً مقدار می‌گیرد
    difficulty: "1", // پیش‌فرض: "آسان"
  });
  const [error, setError] = useState(""); // Error message state

  // نام کاربری و توکن را از localStorage می‌گیریم
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("userToken");

  /**
   * گرفتن سؤالات طراحی‌شده توسط کاربر
   */
  const fetchQuestions = async () => {
    // چک کردن وجود نام کاربری و توکن
    if (!username) {
      setError("نام کاربری پیدا نشد. لطفاً وارد شوید.");
      return;
    }
    if (!token) {
      setError("توکن یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/question-by-user?username=${username}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();

        console.log("Raw Questions Data from API:", result?.dto?.questions);

        if (result.responseHeader === "OK") {
          const difficultyMapping = { 1: "آسان", 2: "متوسط", 3: "سخت" };
          const formattedQuestions = result.dto.questions.map((q) => ({
            text: q.question,
            options: [q.answer1, q.answer2, q.answer3, q.answer4],
            correct: q.correctAnswer ?? "1", // اگر correctAnswer در پاسخ نباشد
            category: q.category,
            difficulty: difficultyMapping[q.hardness] || "نامشخص",
          }));

          console.log(
            "Formatted Questions with Difficulty:",
            formattedQuestions
          );
          setQuestions(formattedQuestions);
        } else {
          setError("خطا در دریافت اطلاعات سوالات.");
        }
      } else {
        setError(`خطا در برقراری ارتباط با سرور (status: ${response.status}).`);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("خطا در ارتباط با سرور.");
    }
  };

  /**
   * گرفتن فهرست دسته‌بندی‌ها
   */
  const fetchCategories = async () => {
    if (!token) {
      setError("توکن یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/categories", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.responseHeader === "OK") {
          setCategories(result.dto.categories);
          // به‌طور پیش‌فرض اولین دسته را انتخاب می‌کنیم (اگر وجود داشته باشد)
          setNewQuestion((prev) => ({
            ...prev,
            category: result.dto.categories[0]?.category_name || "",
          }));
        } else {
          setError("خطا در دریافت اطلاعات دسته‌بندی‌ها.");
        }
      } else {
        setError(`خطا در ارتباط با سرور (status: ${response.status}).`);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("خطا در ارتباط با سرور.");
    }
  };

  /**
   * افزودن سؤال جدید
   */
  const handleAddQuestion = async () => {
    // اول بررسی توکن و نام کاربری
    if (!username) {
      setError("نام کاربری پیدا نشد. لطفاً وارد شوید.");
      return;
    }
    if (!token) {
      setError("توکن یافت نشد. لطفاً ابتدا وارد شوید.");
      return;
    }

    const { text, options, correct, category, difficulty } = newQuestion;
    // اگر می‌خواهید اعتبارسنجی کنید که همه فیلدها پر باشد:
    // if (!text.trim() || options.some((opt) => !opt.trim())) {
    //   setError("تمام فیلدها باید پر شوند.");
    //   return;
    // }

    try {
      const formData = new URLSearchParams();
      formData.append("designer", username);
      formData.append("questionText", text);
      formData.append("answer1", options[0]);
      formData.append("answer2", options[1]);
      formData.append("answer3", options[2]);
      formData.append("answer4", options[3]);
      formData.append("correctAnswer", correct);
      formData.append("hardness", difficulty);
      formData.append("categoryName", category);

      const response = await fetch("http://localhost:8080/add-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: formData.toString(),
      });

      const result = await response.json();

      if (response.ok && result.responseHeader === "OK") {
        // بازنشانی فرم
        setNewQuestion({
          text: "",
          options: ["", "", "", ""],
          correct: "1",
          category: categories[0]?.category_name || "",
          difficulty: "1",
        });
        // مجدداً گرفتن لیست سؤالات
        fetchQuestions();
      } else {
        setError("خطا در افزودن سوال.");
      }
    } catch (err) {
      console.error("Error adding question:", err);
      setError("خطا در ارتباط با سرور.");
    }
  };

  /**
   * دکمه تغییر حالت تاریک
   */
  const handleToggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  /**
   * اولین بار که کامپوننت لود می‌شود
   */
  useEffect(() => {
    fetchQuestions();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * هربار state darkMode تغییر کند
   */
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  /**
   * تابع کمک‌کننده برای مدیریت ورودی فرم
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // اگر name شبیه "option1","option2" بود
    if (name.startsWith("option")) {
      const index = parseInt(name.replace("option", "")) - 1;
      const updatedOptions = [...newQuestion.options];
      updatedOptions[index] = value;
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    } else {
      setNewQuestion({ ...newQuestion, [name]: value });
    }
  };

  return (
    <div className="main-container">
      <DesignerNavbar />

      {/* دکمه تاریک/روشن */}
      <button
        id="dark-mode-toggle"
        className="dark-mode-btn"
        onClick={handleToggleDarkMode}
      >
        <span id="icon">{darkMode ? "🌜" : "🌞"}</span>
      </button>

      <div className="question-box">
        <h2>مدیریت سوالات</h2>

        {/* نمایش خطا (اگر وجود داشته باشد) */}
        {error && <p className="error-message">{error}</p>}

        {/* فرم افزودن سؤال */}
        <div className="add-question">
          <textarea
            id="question-text"
            name="text"
            placeholder="متن سوال"
            rows="3"
            value={newQuestion.text}
            onChange={handleInputChange}
          ></textarea>
          {newQuestion.options.map((option, index) => (
            <input
              key={index}
              type="text"
              name={`option${index + 1}`}
              placeholder={`گزینه ${index + 1}`}
              value={option}
              onChange={handleInputChange}
            />
          ))}
          <label htmlFor="correct-answer">پاسخ صحیح:</label>
          <select
            id="correct-answer"
            name="correct"
            value={newQuestion.correct}
            onChange={handleInputChange}
          >
            {newQuestion.options.map((_, index) => (
              <option key={index + 1} value={index + 1}>
                گزینه {index + 1}
              </option>
            ))}
          </select>

          <label htmlFor="category">دسته‌بندی سوال:</label>
          <select
            id="category"
            name="category"
            value={newQuestion.category}
            onChange={handleInputChange}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat.category_name}>
                {cat.category_name}
              </option>
            ))}
          </select>

          <label htmlFor="difficulty">درجه دشواری:</label>
          <select
            id="difficulty"
            name="difficulty"
            value={newQuestion.difficulty}
            onChange={handleInputChange}
          >
            <option value="1">آسان</option>
            <option value="2">متوسط</option>
            <option value="3">سخت</option>
          </select>

          <button id="add-question-btn" onClick={handleAddQuestion}>
            افزودن سوال
          </button>
        </div>

        {/* نمایش سؤالات طراحی‌شده */}
        <div className="questions-container" id="questions-container">
          {questions.map((q, index) => (
            <div key={index} className="question-item">
              <h3>متن سوال: {q.text}</h3>
              {q.options.map((option, i) => {
                const isCorrect = (i + 1) === parseInt(q.correct);
                return (
                  <p key={i} style={isCorrect ? { color: "green" } : {}}>
                    گزینه {i + 1}: {option}
                  </p>
                );
              })}
              <p>دسته‌بندی: {q.category}</p>
              <p>درجه دشواری: {q.difficulty}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Questions;
