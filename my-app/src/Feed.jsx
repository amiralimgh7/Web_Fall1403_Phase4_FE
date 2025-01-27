import React, { useEffect, useState } from "react";
import NavbarPlayer from "./components/NavbarPlayer";
import "./Feed.css";
import axios from "axios";

const Feed = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  // از localStorage شناسه و نام کاربری کاربر فعلی را می‌خوانیم
  const currentUserId = localStorage.getItem("currentUserId"); 
  const username = localStorage.getItem("username");

  // تابع گرفتن سؤالات فید
  const fetchFeedQuestions = async () => {
    try {
      // با توجه به Backend:
      //  GET /feed?username=...
      //  در params می‌توان userId را هم ارسال کرد، اما طبق کد فعلی بک‌اند،
      //  ظاهراً feed فقط با username کاربر را پیدا می‌کند.
      const response = await axios.get(`http://localhost:8080/feed?username=${username}`);

      if (response.data.responseHeader === "OK") {
        const rawQuestions = response.data.dto.questions || [];
        // لازم است داده را فرمت کنیم تا گزینه‌ها (options) و غیره مرتب شوند
        const newQuestions = rawQuestions.map((q) => ({
          id: q.id,
          text: q.question,
          options: [q.answer1, q.answer2, q.answer3, q.answer4],
          correctAnswer: q.correctAnswer, // اینجا رشته است. مثلاً "2"
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

  // تابع برای پاسخ‌دادن به سؤال
  const handleAnswer = async (questionId, selectedOption) => {
    try {
      // API شما: POST /answer-question
      // با پارامترهای username, questionId, answer
      const response = await axios.post("http://localhost:8080/answer-question", null, {
        params: {
          username: username,         // نام کاربری لاگین‌شده
          questionId: questionId,     // شناسه سؤال
          answer: selectedOption,      // گزینه انتخابی (۱ تا ۴)
        },
      });

      if (response.data.responseHeader === "OK") {
        // بک‌اند در فیلد dto ممکن است correctAnswer واقعی را برگرداند.
        // طبق کد شما: برمی‌گرداند IntegerDto با value = correctAnswer
        const correctAnswer = response.data.dto.value;
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

  // در بارگذاری اولیه صفحه، فید را می‌گیریم
  useEffect(() => {
    fetchFeedQuestions();
  }, []);

  return (
    <div className="main-container">
      <NavbarPlayer />

      <button
        id="dark-mode-toggle"
        className="dark-mode-btn"
        onClick={() => document.body.classList.toggle("dark-mode")}
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

            {/* نمایش پاسخ درست به صورت ثابت (اگر می‌خواهید همیشه نشان دهید) 
            
            /* <p>پاسخ درست: گزینه {question.correctAnswer}</p>
            
            */}
           
          </div>
        ))}

        {questions.length === 0 && !error && (
          <p>هیچ سوالی برای نمایش وجود ندارد.</p>
        )}
      </div>
    </div>
  );
};

export default Feed;
