import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import InsertEquipo from './pages/InsertEquipo';
import InsertProduct from './pages/InsertProduct';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';
import UserProfile from './pages/UserProfile';
import PasswordResetOptions from './components/Modal-login';
import { useAuth } from './context/AuthContext.jsx';
import { useCart } from './context/CartContext.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import './styles/app.css'

export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { userRole, isLoading } = useAuth();
    const { isPaymentModalOpen, setIsPaymentModalOpen, cart, totalPrice, clearCart, triggerStockRefresh } = useCart();

    const openLoginModal = () => {
        setIsModalOpen(true);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleCheckoutSuccess = () => {
        alert('¡Pago procesado con éxito! Gracias por tu compra.');
        clearCart();
        setIsPaymentModalOpen(false);
        triggerStockRefresh();
    };

    return (
        <Router>
            <ScrollToTop />
            <Header
                onLoginClick={toggleModal}
                isModalOpen={isModalOpen}
                onModalClose={() => setIsModalOpen(false)}
            />
            <div className="page-with-admin-bar">
                <div className="mainpage-div">
                    {(isLoading) && (
<div className="loading-overlay"><div className="spinner"></div></div>
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
                        <Route path="/insertEquipo" element={<InsertEquipo />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/insertProduct" element={<InsertProduct />} />
                        <Route path="/userprofile" element={<UserProfile />} />
                        <Route path="*" element={<div>404 Not Found</div>} />
                    </Routes>
                </div>
            </div>
            {userRole === 'admin' && <AdminBar />}
            <Footer />
            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onRequestClose={() => setIsPaymentModalOpen(false)}
                mode="cart"
                cart={cart}
                totalPrice={totalPrice}
                onSuccess={handleCheckoutSuccess}
            />
        </Router>
    );
}
