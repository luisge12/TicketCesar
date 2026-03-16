// BlogArticle.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import './../styles/blog-article.css';

export default function BlogArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    console.log('Solicitando artículo con id:', id);
    setArticle(null);

    // Fetch article
    const fetchArticle = fetch(`${API_URL}/articles/${id}`)
      .then(res => res.json());

    // Fetch session
    const fetchSession = fetch(`${API_URL}/session`, { credentials: 'include' })
      .then(res => res.json());

    Promise.all([fetchArticle, fetchSession])
      .then(([articleData, sessionData]) => {
        console.log('Artículo recibido del backend:', articleData);
        if (articleData && !articleData.error) {
          setArticle(articleData);
        }

        if (sessionData.isAuthenticated && sessionData.user) {
          setUserRole(sessionData.user.role);
        }
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setArticle(null);
      });
  }, [id]);

  const nextImage = () => {
    if (!article || !article.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % article.images.length);
  };

  const prevImage = () => {
    if (!article || !article.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + article.images.length) % article.images.length);
  };

  if (!article) {
    return <div className="blog-home"><h2>Artículo no encontrado</h2></div>;
  }

  // Ensure content and images are arrays if they came as single values
  const paragraphs = Array.isArray(article.content) ? article.content : [article.content];
  const images = Array.isArray(article.images) && article.images.length > 0 ? article.images : (article.image ? [article.image] : []);

  return (
    <div className="blog-article-page-container">
      <div className="blog-article-main">
        <nav className="blog-nav" style={{ width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button className="blog-nav-btn" onClick={() => navigate('/')}>Menú</button>
            <button className="blog-nav-btn" onClick={() => navigate('/blog')}>Blog</button>
            <button className="blog-nav-btn active" disabled>Artículo</button>
          </div>

          {userRole === 'admin' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="blog-nav-btn"
                onClick={() => navigate(`/editArticle/${id}`)}
                style={{ background: 'var(--black)', color: 'white' }}
              >
                Editar
              </button>
              <button
                className="blog-nav-btn"
                onClick={async () => {
                  if (window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
                    try {
                      const res = await fetch(`${API_URL}/articles/${id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      if (res.ok) {
                        alert('Artículo eliminado');
                        navigate('/blog');
                      } else {
                        alert('Error al eliminar artículo');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Error de conexión');
                    }
                  }
                }}
                style={{ background: '#ef4444', color: 'white' }}
              >
                Eliminar
              </button>
            </div>
          )}
        </nav>

        <header className="blog-article-header">
          <h1 className="blog-article-title">{article.title}</h1>
          <p className="blog-article-excerpt">{article.excerpt}</p>
        </header>

        {/* Article Image Carousel */}
        {images.length > 0 && (
          <div className="article-carousel-container">
            {images.map((img, idx) => (
              <div key={idx} className={`carousel-slide ${idx === currentImageIndex ? 'active' : ''}`}>
                <img className="carousel-image" src={img} alt={`${article.title} - ${idx + 1}`} />
              </div>
            ))}

            {images.length > 1 && (
              <>
                <button className="carousel-button prev" onClick={prevImage}>❮</button>
                <button className="carousel-button next" onClick={nextImage}>❯</button>

                <div className="carousel-indicators">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="blog-article-content">
          {paragraphs.map((p, idx) => {
            // Helper to safely extract text from potential JSON strings if they leaked through
            const renderText = (val) => {
              if (typeof val === 'string' && val.trim().startsWith('{')) {
                try {
                  const parsed = JSON.parse(val);
                  return parsed.text || val;
                } catch (e) {
                  return val;
                }
              }
              return val;
            };

            return (
              <div key={idx} id={`section-${idx}`} className="paragraph-block">
                {p?.subtitle && <h2 className="paragraph-subtitle">{p.subtitle}</h2>}
                <p className="blog-article-paragraph">
                  {typeof p === 'object' ? renderText(p.text) : renderText(p)}
                </p>
              </div>
            );
          })}
        </div>

        <footer className="blog-article-footer">
          <span className="footer-author">Autor: {article.author}</span>
          <span className="footer-date">Fecha: {new Date(article.date).toLocaleDateString()}</span>
        </footer>
      </div>
    </div>
  );
}
