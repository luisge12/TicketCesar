import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import UserRegister from './pages/UserRegister';
import AdminBar from './pages/Admin';
import ModalContent from './components/Modal-login';
import InsertEvent from './pages/InsertEvent';
import InsertArticle from './pages/InsertArticle';
import ReservEvent from './pages/ReservEvent';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import QuienesSomos from './pages/QuienesSomos';
import Visitanos from './pages/Visitanos';
import './styles/app.css'

export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar autenticación al cargar la app
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('http://localhost:3000/', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                
                setIsAuthenticated(data.isAuthenticated);
                
                // Si está autenticado, guardar el rol del usuario
                if (data.isAuthenticated && data.user) {
                    setUserRole(data.user.role);
                    //console.log('Usuario autenticado con rol:', data.user.role);
                } else {
                    setUserRole(null);
                }
                
            } catch (error) {
                console.error('Error verificando autenticación:', error);
                setIsAuthenticated(false);
                setUserRole(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const onLogout = () => { 
        setIsAuthenticated(false);
        setUserRole(null);
    };

    const inLoginAdmin = () =>  {
        setIsAuthenticated(true);
        setUserRole('admin');
    }

    return (
        <Router>
            <Header 
                onLoginClick={toggleModal} 
                isModalOpen={isModalOpen}
                onModalClose={() => setIsModalOpen(false)}
                onLogout={onLogout}
                inLoginAdmin={inLoginAdmin}
            />
            <div className="page-with-admin-bar">
                <div className="mainpage-div">
                    { (isLoading) && (
                        <div className='color-white bg-black'>Cargando...</div>
                    )
                    }
                    

                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/UserRegister" element={<UserRegister />} />
                        <Route path="/event" element={<div>Acá vamos a ver los eventos y el manejo de ventas</div>} />
                        <Route path="/insertEvent" element={ <InsertEvent /> } />
                        <Route path="/insertArticle" element={ <InsertArticle /> } />
                        <Route path="/event/:id" element={<ReservEvent />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:id" element={<BlogArticle />} />
                        <Route path="/quienes-somos" element={<QuienesSomos />} />
                        <Route path="/visitanos" element={<Visitanos />} />
                        <Route path="*" element={<div>404 Not Found</div>} />
                    </Routes>
                </div>
                {/* The ModalContent component is rendered only if isModalOpen is true */}
                {isModalOpen && (
                    <div className="modal-backdrop" onClick={toggleModal}>
                        <div className="modal-container" onClick={e => e.stopPropagation()}>
                            
                            <ModalContent inLoginAdmin = {inLoginAdmin} onClose={toggleModal} onLogout={onLogout} />
                        </div>
                    </div>
                )}
            </div>
            {userRole === 'admin' && <AdminBar />}
            <Footer />
        </Router>
    );

}
