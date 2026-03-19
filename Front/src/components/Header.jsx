import { useState, useEffect } from "react";
import Modal from "react-modal";
import './../styles/header.css';
import ModalContent from "./Modal-login";
import { useNavigate } from 'react-router-dom';
import { useNavData } from '../hooks/useNavData.js';

Modal.setAppElement('#root');

export default function Header({ isModalOpen, onLoginClick, onModalClose }) {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  const { BLOG_SECTIONS, categoryEvents, groupedArticles, loadingArticles } = useNavData();

  const isOpen = isModalOpen !== undefined ? isModalOpen : false;
  const handleModalOpen = onLoginClick || (() => {});
  const handleModalClose = onModalClose || (() => {});

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 60 && !isOpen) {
        setHidden(true);
      } else if (currentScroll < lastScroll) {
        setHidden(false);
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll, isOpen]);

  return (
    <header className={`header-main ${hidden ? 'hidden-header' : ''}`}>
      <Modal
        isOpen={isOpen}
        onRequestClose={handleModalClose}
        contentLabel="User Menu"
        className="modal-main"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <ModalContent onClose={handleModalClose}/>
      </Modal>

      <div className="div-left">
        <button className="logo-button" onClick={() => navigate('/')}> 
          <img src="/src/assets/logoteatro.jpg" className="logo-img" alt="Logo" />
        </button>
        <div className="">
          <ul className="nav-buttons-cont">
            <li className="first-menu">
              Espectáculos 
              <ul>
                <li className="second-menu">
                  Danza
                  <ul>
                    {categoryEvents['Danza'] ? (
                      categoryEvents['Danza'].map((event) => (
                        <li key={event.id} onClick={() => navigate(`/event/${event.id}`)} style={{cursor: 'pointer'}}>
                          {event.name}
                        </li>
                      ))) : (<li>Loading...</li>
                    )}
                  </ul>
                </li>
                <li className="second-menu">
                  Musica
                  <ul>
                    {categoryEvents['Musica'] ? (
                      categoryEvents['Musica'].map((event) => (
                        <li key={event.id} onClick={() => navigate(`/event/${event.id}`)} style={{cursor: 'pointer'}}>
                          {event.name}
                        </li>
                      ))) : (<li>Loading...</li>
                    )}
                  </ul>
                </li>
                <li className="second-menu">
                  Teatro
                  <ul>
                    {categoryEvents['Teatro'] ? (
                      categoryEvents['Teatro'].map((event) => (
                        <li key={event.id} onClick={() => navigate(`/event/${event.id}`)} style={{cursor: 'pointer'}}>
                          {event.name}
                        </li>
                      ))) : (<li>Loading...</li>
                    )}
                  </ul>
                </li>
                <li className="second-menu">
                  Grados
                  <ul>
                    {categoryEvents['Grados'] ? (
                      categoryEvents['Grados'].map((event) => (
                        <li key={event.id} onClick={() => navigate(`/event/${event.id}`)} style={{cursor: 'pointer'}}>
                          {event.name}
                        </li>
                      ))) : (<li>Loading...</li>
                    )}
                  </ul>
                </li>
                <li className="second-menu">
                  Recorridos
                  <ul>
                    {categoryEvents['Recorridos'] ? (
                      categoryEvents['Recorridos'].map((event) => (
                        <li key={event.id} onClick={() => navigate(`/event/${event.id}`)} style={{cursor: 'pointer'}}>
                          {event.name}
                        </li>
                      ))) : (<li>Loading...</li>
                    )}
                  </ul>
                </li>
              </ul>
            </li>
            
            <li
              className="first-menu"
              onClick={() => {
                const scrollToProximos = () => {
                  const section = document.getElementById("proximos-espectaculos");
                  if (section) {
                    const y = section.getBoundingClientRect().top + window.scrollY ;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                };

                if (window.location.pathname !== "/") {
                  navigate("/", { replace: false });
                  setTimeout(scrollToProximos, 300);
                } else {
                  scrollToProximos();
                }
              }}
            >
              Adquirir entradas
            </li>
            <li className="first-menu" onClick={() => navigate('/alquiler')} style={{ cursor: 'pointer' }}>
              Alquiler
            </li>
            <li className="first-menu">
              Kiosco César
            </li>
            <li className="first-menu" onClick={() => navigate('/visitanos')} style={{ cursor: 'pointer' }}>
              Visítanos
            </li>
            
            <li className="first-menu">
              <button className="menu-link" onClick={() => navigate('/blog')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                Blog
              </button>
              <ul>
                {BLOG_SECTIONS.map((section) => (
                  <li className="second-menu" key={section}>
                    {section}
                    <ul>
                      {loadingArticles ? (
                        <li>Loading...</li>
                      ) : (groupedArticles[section] && groupedArticles[section].length === 0) ? (
                        <li>No hay artículos</li>
                      ) : (
                        groupedArticles[section].map((article) => (
                          <li
                            key={article.id || article._id}
                            onClick={() => navigate(`/blog/${article.id || article._id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            {article.title || article.name || 'Sin título'}
                          </li>
                        ))
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <div className="div-right">
        <input
          type="text"
          placeholder=""
          className="nav-searcher"
          name="search_input"
        />
        <button className="user-button" onClick={handleModalOpen}>
          <img src="/src/assets/user.png" alt="userslogo" className="user-img" />
        </button>
      </div>
    </header>
  );
}
