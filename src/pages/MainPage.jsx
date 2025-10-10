import './../styles/main-page.css' 
import { useState, useEffect, useRef, useCallback } from 'react';
import img1 from '../assets/carousel/1.webp';
import img2 from '../assets/carousel/2.webp';
import img3 from '../assets/carousel/3.webp';
import img4 from '../assets/carousel/4.webp';
import img5 from '../assets/carousel/5.webp';
import img6 from '../assets/carousel/6.webp';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from "react-modal";
import ModalContent from "../components/Modal-login";

Modal.setAppElement('#root');

const images = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
];

export default function MainPage({ inLoginAdmin }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const extendedImages = [images[images.length - 1], ...images, images[0]];
    const [current, setCurrent] = useState(1);
    const [transition, setTransition] = useState(true);
    const sliderRef = useRef();
    const intervalRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);

    const setIsModalOpen = () => {
        setModalOpen(!isModalOpen);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await fetch('http://localhost:3000/get-events', {
                credentials: 'include'
            });
            const data = await response.json();
            setEvents(data);
        };
        fetchEvents();
    }, []);

    const nextImage = useCallback(() => {
        setCurrent((prev) => prev + 1);
        setTransition(true);
    }, []);

    const prevImage = useCallback(() => {
        setCurrent((prev) => prev - 1);
        setTransition(true);
    }, []);

    const startAutoSlide = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            nextImage();
        }, 3000);
    }, [nextImage]);

    useEffect(() => {
        startAutoSlide();
        return () => clearInterval(intervalRef.current);
    }, [startAutoSlide]);

    useEffect(() => {
        if (current === extendedImages.length - 1) {
            setTimeout(() => {
                setTransition(false);
                setCurrent(1);
            }, 500);
        }
        if (current === 0) {
            setTimeout(() => {
                setTransition(false);
                setCurrent(extendedImages.length - 2);
            }, 500);
        }
    }, [current, extendedImages.length]);

    useEffect(() => {
        if (!transition) {
            setTimeout(() => setTransition(true), 20);
        }
    }, [transition]);

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Verifica la sesión igual que en Header.jsx
    async function checkSession() {
        try {
            const response = await fetch('http://localhost:3000/', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            return data.isAuthenticated;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    const handleEventClick = async (eventId) => {
        const isLoggedIn = await checkSession();
        if (isLoggedIn) {
            navigate(`/event/${eventId}`);
        } else {
            alert('Debes iniciar sesión para ver el evento.');
            setIsModalOpen();
        }
    };

    return (
        <div className="mainpage-div">
            <div className='mainpage-container'>
                <div className='image-slider' style={{ overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}>
                    <div className="slider-text-overlay1">
                        <h1>Ticket Cesar</h1>
                    </div>
                    <div className="slider-text-overlay2">
                        <h1>A Mérida lo que es del Cesar</h1>
                    </div>
                    <div
                        className="slider-track"
                        ref={sliderRef}
                        style={{
                            display: 'flex',
                            transition: transition ? 'transform 0.5s ease' : 'none',
                            transform: `translateX(-${current * (100 / extendedImages.length)}%)`,
                            width: `${extendedImages.length * 100}%`,
                            height: '100%',
                        }}
                    >
                        {extendedImages.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`slide ${idx}`}
                                style={{
                                    width: `${100 / extendedImages.length}%`,
                                    height: '100%',
                                    objectFit: 'cover',
                                    flexShrink: 0
                                }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={prevImage}
                        className='events-scroll-btn left'
                    >
                        &lt;
                    </button>
                    
                    <button
                        onClick={nextImage}
                        className='events-scroll-btn right'
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* ==== Events Slider Section ==== */}

            <div className='events-slider' id='proximos-espectaculos'>
                <h1>Próximos Espectaculos</h1>
                
                <div className='events-container'>
                    <button
                        onClick={() => {
                            const container = document.querySelector('.event-card');
                            container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
                        }}
                        className='events-scroll-btn left'
                    >
                        &lt;
                    </button>
                        
                    <button
                        onClick={() => {
                            const container = document.querySelector('.event-card');
                            container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
                        }}
                        className='events-scroll-btn right'
                    >
                        &gt;
                    </button>
                    <div className='event-card'>
                        {events.length === 0 ? (
                            <p>No hay eventos disponibles.</p>
                        ) : (
                            events.map(event => (
                                <div key={event.id} className="event-item" onClick={() => handleEventClick(event.id)}>
                                    <img src={event.image_url ? event.image_url : null} alt={event.name} className="event-image" />
                                    <h2 className="event-title">{event.name}</h2>
                                    <p className="event-date">
                                        {formatDate(event.date_start) === formatDate(event.date_end)
                                            ? formatDate(event.date_start)
                                            : `${formatDate(event.date_start)} - ${formatDate(event.date_end)}`}
                                    </p>
                                    <p className="event-description">{event.description}</p>
                                    <p className="event-description">{event.category}</p>  
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para login, igual que Header.jsx */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={setIsModalOpen}
                contentLabel="User Menu"
                className="modal-main"
                overlayClassName="modal-overlay"
                ariaHideApp={false}
            >
                <ModalContent onLogout={() => {}} inLoginAdmin={inLoginAdmin}/>
            </Modal>
        </div>
    );
}