import { useState } from "react";
import { API_URL } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import './../styles/header.css';

export default function ModalContent({ onClose }) {
    const { isAuthenticated, user, login, logout, isLoading: isAuthLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userDataParams = {
            email: email,
            password: password
        };

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userDataParams),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.user);
                setMessage("");
                setTimeout(() => { if(onClose) onClose(); }, 1500);
            } else {
                const errorData = await response.json();
                console.error('Login failed:', errorData);
                setMessage('Login fallido: ' + errorData.error);
            }

        } catch (error) {
            console.error('Error during login:', error);
            setMessage('Ocurrió un error durante el login');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading) {
        return <div className="loading-container">Cargando...</div>;
    }

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            logout();
            setMessage('Sesión cerrada correctamente.');
        } catch (error) {
            setMessage('Error al cerrar sesión.');
        }
    };

    return (
        <div className="modal-main">
            {isAuthenticated ? (
                <div className="">
                    {user && (
                        <div className="welcome-message">
                            <h2>Bienvenido, {user.name} {user.lastname}!</h2>
                        </div>
                    )}
                    <button
                        className="modal-buttons"
                        style={{ marginTop: "1rem" }}
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                    {message && <div className="message-container">{message}</div>}
                </div>
            ) : (
                <form className="form-modal-container" onSubmit={handleSubmit}>
                    <label className="modal-labels">Email
                        <input
                            type="email"
                            placeholder="Email"
                            className="modal-input"
                            id="email-input"
                            name="email"
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                    <label className="modal-labels">Contraseña
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="modal-input"
                            id="password-input"
                            name="password"
                            autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    <button
                        type="submit"
                        className="modal-buttons"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                    <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                        <a href="/forgot-password" style={{ color: 'black', textDecoration: 'underline', fontSize: '0.9rem' }}>
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                    <label className="modal-labels">
                        ¿No tienes una cuenta?
                    </label>
                    <button
                        type="button"
                        className="modal-buttons"
                        onClick={() => window.location.href = "./UserRegister"}
                    >
                        Registrarse
                    </button>
                    {message && <div className="message-container">{message}</div>}
                </form>
            )}
        </div>
    );
}