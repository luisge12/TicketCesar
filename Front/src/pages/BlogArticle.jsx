// BlogArticle.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './../styles/blog-article.css';



export default function BlogArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);


  useEffect(() => {
    console.log('Solicitando artículo con id:', id);
    setArticle(null);
  fetch(`http://localhost:3000/articles/${id}`)
      .then(res => {
        console.log('Respuesta fetch:', res);
        return res.json();
      })
      .then(data => {
        console.log('Artículo recibido del backend:', data);
        if (data && !data.error) {
          setArticle(data);
        } else {
          setArticle(null);
        }
      })
      .catch((err) => {
        console.error('Error en fetch:', err);
        setArticle(null);
      });
  }, [id]);


  if (!article) {
    return <div className="blog-home"><h2>Artículo no encontrado</h2></div>;
  }

  return (
    <div className="blog-article-main">
      <nav className="blog-nav" style={{ width: '100%' }}>
        <button className="blog-nav-btn" onClick={() => navigate('/')}>Menú</button>
        <button className="blog-nav-btn" onClick={() => navigate('/blog')}>Blog</button>
        <button className="blog-nav-btn active" disabled>Artículo</button>
      </nav>
      <h1 className="blog-article-title">{article.title}</h1>
      <p className="blog-article-excerpt" style={{textAlign: 'center', color: 'var(--grey)', fontSize: '1.2rem', marginBottom: '1.5rem'}}>{article.excerpt}</p>
  <img className="blog-article-image" src={article.image} alt={article.title} />
      <div className="blog-article-content">
        {article.content || 'Contenido completo del artículo...'}
      </div>
      <footer className="blog-article-footer" style={{marginTop: '2.5rem', textAlign: 'center', color: 'var(--grey)', fontSize: '1rem'}}>
        <span>Autor: {article.author}</span> &nbsp;|&nbsp; <span>Fecha: {article.date}</span>
      </footer>
    </div>
  );
}
