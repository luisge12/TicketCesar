import { API_URL } from '../config.js';
import './../styles/main-page.css'
import { useState, useEffect, useRef } from 'react';
import img1 from '../assets/carousel/1.webp';
import img2 from '../assets/carousel/2.webp';
import img3 from '../assets/carousel/3.webp';
import img4 from '../assets/carousel/4.webp';
import img5 from '../assets/carousel/5.webp';
import img6 from '../assets/carousel/6.webp';
import { useNavigate, useLocation } from 'react-router-dom';
// Importa más imágenes si tienes

const images = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
];

export default function MainPage() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const extendedImages = [images[images.length - 1], ...images, images[0]];
    const [current, setCurrent] = useState(1);
    const [transition, setTransition] = useState(true);
    const sliderRef = useRef();
    const intervalRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await fetch(`${API_URL}/get-events`, {
                credentials: 'include'
            });
            const data = await response.json();
            setEvents(data);
        };

        fetchEvents();
    }, []);

    const startAutoSlide = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            nextImage();
        }, 3000);
    };

    const nextImage = () => {
        setCurrent((prev) => prev + 1);
        setTransition(true);
        startAutoSlide(); // Reinicia el conteo
    };
    const prevImage = () => {
        setCurrent((prev) => prev - 1);
        setTransition(true);
        startAutoSlide(); // Reinicia el conteo
    };

    useEffect(() => {
        startAutoSlide();
        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line
    }, []);

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

    //useEffect para datos de usuarios
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/session`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.isAuthenticated && data.user) {
                    setUserRole(data.user.role);
                } else {
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Error verificando autenticación:', error);
                setUserRole(null);
            }
        };

        checkAuthStatus();
    }, []);
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function formatTime(timeString) {
        if (!timeString) return '';
        const [hourStr, minuteStr] = timeString.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'pm' : 'am';
        hour = hour % 12;
        hour = hour ? hour : 12; // la hora '0' deberia ser '12'
        return `${hour}:${minuteStr} ${ampm}`;
    }

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
                                <div key={event.id} className="event-item" onClick={() => navigate(`/event/${event.id}`)}>
                                    <img src={event.image} alt={event.name} className="event-image" />
                                    <h2 className="event-title">{event.name}</h2>
                                    <p className="event-date">
                                        {formatDate(event.date_start)} {event.hour ? `- ${formatTime(event.hour)}` : ''}
                                    </p>
                                    <p className="event-description">{event.excerpt}</p>
                                    <p className="event-category">{event.category}</p>
                                    {userRole === 'admin' && (
                                        <button
                                            className="edit-event-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/editEvent/${event.id}`);
                                            }}
                                        >
                                            Editar Evento
                                        </button>
                                    )}
                                </div>
                            )))}
                    </div>

                </div>

            </div>

        </div>
    );
}