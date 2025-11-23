import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './../styles/blog.css';

const BlogHome = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(6);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString();
  };


  // Cargar artículos desde el backend
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/get-articles')
      .then(res => res.json())
      .then(data => {
          console.log('Artículos recibidos del backend:', data);
        setArticles(data);
        setFilteredArticles(data);
        setLoading(false);
      })
      .catch(err => {
        setArticles([]);
        setFilteredArticles([]);
        setLoading(false);
        console.error('Error fetching articles:', err);
      });
  }, []);

  // Filtrar artículos basado en la búsqueda
  useEffect(() => {
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
    setCurrentPage(1); // Resetear a la primera página al buscar
  }, [searchTerm, articles]);

  // Calcular artículos para la página actual
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);


  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Navegación entre páginas
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="blog-home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando artículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-home">
      {/* Navegación */}
      <nav className="blog-nav" style={{ background: 'none', color: 'var(--black)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className={`blog-nav-btn ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Menú Inicial</button>
          <button className={`blog-nav-btn ${location.pathname.startsWith('/blog') ? 'active' : ''}`} onClick={() => navigate('/blog')}>Blog</button>
        </div>
      </nav>
      <div className="blog-main-content">
        {/* Lista de artículos */}
        <main className="articles-section" style={{ flex: 1 }}>
          <div className="container">
            <h1 className="blog-articles-title">Blog</h1>
            {currentArticles.length > 0 ? (
              <div className="articles-grid">
                {currentArticles.map(article => (
                  <article key={article.id} className="article-card">
                    <div className="article-image">
                      <img src={article.image} alt={article.title} />
                      <span className="article-category">{article.category}</span>
                    </div>
                    <div className="article-content">
                      <h2 className="article-title">{article.title}</h2>
                      <p className="article-excerpt">{article.excerpt}</p>
                      <div className="article-meta">
                        <span className="article-author">{article.author}</span>
                        <span className="article-date">{formatDate(article.date)}</span>
                        {/* <span className="article-read-time">{article.readTime} de lectura</span> */}
                      </div>
                      <button className="read-more-btn" onClick={() => {
                        console.log('Navegando a /blog/' + article.id);
                        navigate(`/blog/${article.id}`);
                      }}>Leer más</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-articles">
                <h3>No se encontraron artículos</h3>
                <p>Intenta con otros términos de búsqueda</p>
              </div>
            )}
            {/* Navegación entre páginas */}
            {filteredArticles.length > articlesPerPage && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  style={{ marginRight: 'auto' }}
                >
                  Anterior
                </button>
                <div className="page-numbers" style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
                  {getPageNumbers().map(number => (
                    <button
                      key={number}
                      className={`page-number ${currentPage === number ? 'active' : ''}`}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button 
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={{ marginLeft: 'auto' }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </main>
        {/* Barra lateral de filtros */}
        <aside className="blog-sidebar" style={{ width: '320px', background: 'var(--beige)', padding: '2rem 1rem', borderLeft: '2px solid var(--grey)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Barra de búsqueda */}
          <div className="blog-search-section">
            <div className="blog-search-container">
              <div className="blog-search-container2">
                <input
                  type="text"
                  className="blog-search-input"
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {searchTerm && (
                <div className="search-results-info">
                  <p>
                    {filteredArticles.length} artículo{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''} 
                    {searchTerm && ` para "${searchTerm}"`}
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Filtros por categoría */}
          <div className="blog-filter-section">
            <h3 style={{ color: 'var(--black)', marginBottom: '1rem' }}>Filtrar por Categoría</h3>
            <select style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--grey)', background: 'white', color: 'var(--black)' }}
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
            >
              <option value="">Todas</option>
              {[...new Set(articles.map(a => a.category))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* Filtros por fecha */}
          <div className="blog-filter-section">
            <h3 style={{ color: 'var(--black)', marginBottom: '1rem' }}>Filtrar por Fecha</h3>
            <input type="date" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--grey)', background: 'white', color: 'var(--black)' }}
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogHome;