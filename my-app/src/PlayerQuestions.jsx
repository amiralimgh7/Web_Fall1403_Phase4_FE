import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import "./player_questions.css";

const PlayerQuestions = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [categories, setCategories] = useState([]); // Categories from API
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchUserQuestions();
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);


  const fetchUserQuestions = async () => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("نام کاربری پیدا نشد. لطفاً وارد شوید.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/question-by-user?username=${username}`);
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

  
  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/categories");
      const result = await response.json();
      if (result.responseHeader === "OK") {
        setCategories(result.dto.categories); // Assuming categories are in result.dto.categories
      } else {
        console.error("Failed to fetch categories.");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch a random question
  const getRandomQuestion = async () => {
    try {
      const response = await fetch("http://localhost:8080/one-random-question");
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

  // Fetch a random question by category
  const getCategoryQuestion = async () => {
    if (!selectedCategory) {
      alert("لطفاً یک دسته‌بندی انتخاب کنید.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/one-random-question-by-category?categoryName=${selectedCategory}`
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

  // Fetch all questions on page load
  const fetchAllQuestions = async () => {
    try {
      const response = await fetch("http://localhost:8080/question-set");
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

  // Handle answering a question
  const handleAnswer = async (selectedOption) => {
    if (!currentQuestion) return;
  
    try {
      // Call the answer-question API
      const response = await fetch("http://localhost:8080/answer-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: localStorage.getItem("username"),
          questionId: currentQuestion.id,
          answer: selectedOption,
        }).toString(),
      });
  
      const result = await response.json();
      console.log("API Response:", result); // Debug the response

  
      if (response.ok && result.responseHeader === "OK") {
        const correctAnswer = result.dto.value; // Correct answer as an integer from the backend
  
        // Compare the correct answer with the user's selected option
        if (correctAnswer === selectedOption) {
          alert("پاسخ صحیح است!");
        } else {
          alert(`پاسخ اشتباه است! پاسخ صحیح گزینه ${correctAnswer} است.`);
        }
  
        // Add the question to the answered questions list without validation
        setAnsweredQuestions([
          ...answeredQuestions,
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
  
    setCurrentQuestion(null); // Clear the current question
  };
  

  

  useEffect(() => {
    fetchCategories(); // Fetch categories on page load
    fetchAllQuestions(); // Fetch all questions on page load
  }, []);

  return (
    <div className="main-container">
      <NavbarPlayer />

      <button id="dark-mode-toggle" className="dark-mode-btn" onClick={() => setDarkMode(!darkMode)}>
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

          <button id="category-question-btn" className="btn-primary" onClick={getCategoryQuestion}>
            دریافت سوال از دسته‌بندی
          </button>
          <button id="random-question-btn" className="btn-secondary" onClick={getRandomQuestion}>
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
