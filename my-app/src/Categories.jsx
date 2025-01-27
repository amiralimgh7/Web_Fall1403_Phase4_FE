import React, { useState, useEffect } from "react";
import DesignerNavbar from "./components/DesignerNavbar";
import "./categories.css";

const Categories = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/categories");
      if (response.ok) {
        const result = await response.json();
        if (result.responseHeader === "OK") {
          setCategories(result.dto.categories);
        } else {
          setError("خطا در دریافت اطلاعات دسته‌بندی‌ها.");
        }
      } else {
        setError("خطا در ارتباط با سرور.");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("خطا در ارتباط با سرور.");
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() === "") {
      setError("نام دسته نمی‌تواند خالی باشد.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `categoryName=${encodeURIComponent(newCategory)}`,
      });

      const result = await response.json();

      if (response.ok && result.responseHeader === "OK") {
        setNewCategory("");
        fetchCategories();
      } else {
        setError("خطا در افزودن دسته‌بندی.");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      setError("خطا در ارتباط با سرور.");
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <div className="main-container">
      <DesignerNavbar />

      <button id="dark-mode-toggle" className="dark-mode-btn" onClick={handleToggleDarkMode}>
        <i className="fas fa-adjust"></i>
      </button>

      <div className="category-box">
        <h2><i className="fas fa-folder-open"></i> مدیریت دسته‌بندی‌ها</h2>

        {error && <p className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</p>}

        <div className="add-category">
          <input
            type="text"
            id="new-category"
            placeholder="نام دسته جدید"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button id="add-category-btn" onClick={handleAddCategory}>
            <i className="fas fa-plus-circle"></i> افزودن دسته
          </button>
        </div>

        <div className="categories-container" id="categories-container">
          {categories.map((category, index) => (
            <div key={index} className="category-item">
              <h3><i className="fas fa-tags"></i> {category.category_name}</h3>
              <p>تعداد سوالات: {category.number_of_questions}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
