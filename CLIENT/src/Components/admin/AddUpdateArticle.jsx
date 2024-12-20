import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchCategories } from "../../fetch/category.js";
import { fetchArticle } from "../../fetch/article.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import closeMenu from "../../hook/closeMenu.jsx";
import { Link } from "react-router-dom";

function AddUpdateArticle() {
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [img, setImg] = useState(null);
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const userId = useSelector((state) => state.user.id);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  closeMenu();

  function updateCategories() {
    fetchCategories().then((data) => setCategories(data));
  }

  function updateArticles() {
    fetchArticle().then((data) => setArticles(data));
  }

  useEffect(() => {
    updateCategories();
    updateArticles();
  }, []);

  const resetForm = () => {
    setTitle("");
    setAlt("");
    setImg(null);
    setContent("");
    setSelectedCategory("");
    setSelectedArticle(null);
    setIsUpdateMode(false);
  };

  const submitArticleData = async (e) => {
    e.preventDefault();
    if (isUpdateMode && selectedArticle) {
      await onClickUpdateArticle(selectedArticle.id);
    } else {
      await createArticle();
    }
  };

  const createArticle = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("img", img);
    formData.append("alt", alt);
    formData.append("content", content);
    formData.append("category_id", selectedCategory);
    formData.append("user_id", userId);

    const response = await fetch(
      "http://localhost:9000/api/v1/article/create",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (response.ok) {
      resetForm();
      updateArticles();
    } else {
      const errorData = await response.json();
    }
  };

  const onClickUpdateArticle = async (id) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("alt", alt);
    if (img) {
      formData.append("img", img);
    }
    formData.append("content", content);
    formData.append("category_id", selectedCategory);
    formData.append("user_id", userId);

    const response = await fetch(
      `http://localhost:9000/api/v1/article/update/${id}`,
      {
        method: "PATCH",
        body: formData,
        credentials: "include",
      }
    );

    if (response.ok) {
      updateArticles();
      resetForm();
    } else {
      const errorData = await response.json();
    }
  };

  const onClickDeleteArticle = async (id) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet article ?"
    );
    if (confirmDelete) {
      const response = await fetch(
        `http://localhost:9000/api/v1/article/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        updateArticles();
      } else {
        const errorData = await response.json();
      }
    }
  };

  const editArticle = (article) => {
    setSelectedArticle(article);
    setTitle(article.title);
    setAlt(article.alt);
    setImg(null);
    setContent(article.content);
    setSelectedCategory(article.category_id);
    setIsUpdateMode(true);
  };

  return (
    <>
      <main>
        <Link
          id="return-dashboard"
          to="/dashboard"
          aria-label="Retour à la page principal du dashboard"
        >
          <FontAwesomeIcon id="return-dashboard" icon={faArrowLeft} />
        </Link>
        <section className="section-dashboard">
          <form className="form-create-article" onSubmit={submitArticleData}>
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label htmlFor="img">Image</label>
            <input
              type="file"
              id="img"
              name="img"
              onChange={(e) => setImg(e.target.files[0])}
              required
            />

            {isUpdateMode && selectedArticle && selectedArticle.img && (
              <div>
                <p>Image actuelle :</p>
                <img
                  className="img-preview"
                  src={`http://localhost:9000/img/${selectedArticle.img}`}
                  alt="Image actuelle de l'article"
                  required
                />
              </div>
            )}

            <label htmlFor="alt">Alt</label>
            <input
              type="text"
              id="alt"
              name="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              required
            />

            <label htmlFor="category">Sélectionner une catégorie</label>
            <select
              id="category"
              name="category_id"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Choisir une catégorie</option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="">Aucune catégorie disponible</option>
              )}
            </select>

            <label htmlFor="content">Texte</label>
            <textarea
              id="content"
              name="content"
              rows="10"
              cols="50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>

            <button type="submit">
              {isUpdateMode ? "Mettre à jour" : "Publier"}
            </button>
          </form>
          <article className="list-article">
            <h2>Liste des articles</h2>
            <table>
              <thead>
                <tr>
                  <th scope="col">Titre</th>
                  <th scope="col">Date</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>{article.title}</td>
                    <td>
                      <time dateTime={article.publish_date}>
                        {new Date(article.publish_date).toLocaleDateString()}{" "}
                      </time>
                    </td>
                    <td className="contain-btn">
                      <button
                        className="btn-update"
                        onClick={() => editArticle(article)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => onClickDeleteArticle(article.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>
      </main>
    </>
  );
}

export default AddUpdateArticle;
