import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import MainPage from './pages/MainPage';
import UserRegister from './pages/UserRegister';
import AdminBar from './components/AdminBar';
import InsertEvent from './pages/InsertEvent';
import EditEvent from './pages/EditEvent';
import InsertArticle from './pages/InsertArticle';
import ReservEvent from './pages/ReservEvent';
import Blog from './pages/Blog';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BlogArticle from './pages/BlogArticle';
import EditArticle from './pages/EditArticle';
import Quienesomos from './pages/QuienesSomos';
import Visitanos from './pages/Visitanos';
import Equipo from './pages/Equipo';
import Alquiler from './pages/Alquiler';
import Programacion from './pages/Programacion';
import InsertProgramacion from './pages/InsertProgramacion';
import { API_URL } from './config.js';
import './styles/app.css'

export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Función para abrir el modal de login desde otros componentes
    const openLoginModal = () => {
        setIsModalOpen(true);
    };

    // Verificar autenticación al cargar la app
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/session`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                // Si está autenticado, guardar el rol del usuario
                if (data.isAuthenticated && data.user) {
                    setUserRole(data.user.role);
                } else {
                    setUserRole(null);
                }

            } catch (error) {
                console.error('Error verificando autenticación:', error);
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
        setUserRole(null);
    };

    const inLoginAdmin = () => {
        setUserRole('admin');
    }

    return (
        <Router>
            <ScrollToTop />
            <Header
                onLoginClick={toggleModal}
                isModalOpen={isModalOpen}
                onModalClose={() => setIsModalOpen(false)}
                onLogout={onLogout}
                inLoginAdmin={inLoginAdmin}
            />
            <div className="page-with-admin-bar">
                <div className="mainpage-div">
                    {(isLoading) && (
                        <div className='color-white bg-black'>Cargando...</div>
                    )
                    }


                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/UserRegister" element={<UserRegister />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/event" element={<div>Acá vamos a ver los eventos y el manejo de ventas</div>} />
                        <Route path="/insertEvent" element={<InsertEvent />} />
                        <Route path="/editEvent/:id" element={<EditEvent />} />
                        <Route path="/insertArticle" element={<InsertArticle />} />
                        <Route path="/event/:id" element={<ReservEvent openLoginModal={openLoginModal} />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:id" element={<BlogArticle />} />
                        <Route path="/editArticle/:id" element={<EditArticle />} />
                        <Route path="/quienes-somos" element={<Quienesomos />} />
                        <Route path="/visitanos" element={<Visitanos />} />
                        <Route path="/equipo" element={<Equipo />} />
                        <Route path="/alquiler" element={<Alquiler />} />
                        <Route path="/programacion" element={<Programacion />} />
                        <Route path="/insertProgramacion" element={<InsertProgramacion />} />
                        <Route path="*" element={<div>404 Not Found</div>} />
                    </Routes>
                </div>
            </div>
            {userRole === 'admin' && <AdminBar />}
            <Footer />
        </Router>
    );

}

