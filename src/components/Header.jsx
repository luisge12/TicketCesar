// This code is a part of TicketCesar 
// Created by Luis González

import { useState, useEffect } from "react";
import Modal from "react-modal";
import './../styles/header.css';
import ModalContent from "./Modal-login";
import { useNavigate } from 'react-router-dom';

// Configura el elemento app para react-modal (solo una vez al cargar la app)
Modal.setAppElement('#root');


export default function Header({  onLogout, inLoginAdmin }) {
  const navigate = useNavigate();
    const [hidden, setHidden] = useState(false);
    const [lastScroll, setLastScroll] = useState(0);
    const [categories] = useState(['Danza', 'Musica', 'Teatro', 'Grados', 'Recorridos']);
    const [categoryEvents, setCategoryEvents] = useState({});

    const [isModalOpen, setModalOpen] = useState(false);

    const setIsModalOpen = () => {
        setModalOpen(!isModalOpen);
    }

    useEffect(() => {
        const handleScroll = () => {
        const currentScroll = window.scrollY;
      
        if (currentScroll > lastScroll && currentScroll > 60 && !isModalOpen) {
            setHidden(true);
        } else if (currentScroll < lastScroll) {
            setHidden(false);
        }
        setLastScroll(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll, isModalOpen]);

  // get the name events for categories
  useEffect(() => {
  // Limpia el estado antes de cargar nuevos datos si lo deseas
  setCategoryEvents({});

  for (const category of categories) {
    fetch(`http://localhost:3000/events/category/${category}`, {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setCategoryEvents(prev => ({
          ...prev,
          [category]: data
        }));
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }

}, [categories]);
/* // Debugging: muestra los eventos de la categoría "Danza" en la consola
useEffect(() => {
  console.log("categorias: ", categoryEvents['Danza']);
}, [categoryEvents]);
*/

    return (
    <header className={`header-main ${hidden ? 'hidden-header' : ''}`}>
      {/* Modal for user menu */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={setIsModalOpen}
        contentLabel="User Menu"
        className="modal-main"
        overlayClassName="modal-overlay"
        ariaHideApp={false} // Cambiado a false para evitar el error en la consola
      >
        <ModalContent onLogout={onLogout} inLoginAdmin={inLoginAdmin}/>
      </Modal>

      {/*===== Left part of the header =====*/}
      <div className="div-left">
        <button className="logo-button" onClick={() => navigate('/')}> 
          <img src="src/assets/logoteatro.jpg" className="logo-img" alt="Logo" />
        </button>
        <div className="">
          <ul className="nav-buttons-cont">
            <li className="first-menu">
              Espectaculos 
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
            <li className="first-menu">
              Visitanos
            </li>
            <li className="first-menu">
              Blog
              <ul>
                <li className="second-menu">
                  Articulos
                  <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                  </ul>
                </li>
                <li className="second-menu">
                  Reportajes
                  <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                  </ul>
                </li>
                <li className="second-menu">
                  Critica
                  <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                  </ul>
                </li>
                <li className="second-menu">
                  Entrevistas
                  <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                  </ul>
                </li>
                <li className="second-menu">
                  Noticias
                  <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
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
              Comprar Entradas
            </li>
            <li className="first-menu">
              Alquiler
            </li>
            {/* For shop
            <li className="first-menu">
              Tienda
            </li>
            */}

          </ul>
        </div>
      </div>

      {/*===== Right part of the header =====*/}
      <div className="div-right">
        <input
          type="text"
          placeholder=""
          className="nav-searcher"
          name="search_input"
        />
        <button className="user-button" onClick={setIsModalOpen}>
          <img src="./src/assets/user.png" alt="userslogo" className="user-img" />
        </button>
      </div>
    </header>
  );

}