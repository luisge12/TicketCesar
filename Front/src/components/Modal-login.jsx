import { useState, useEffect } from "react";
import { API_URL } from '../config.js';
import './../styles/header.css';

export default function ModalContent({ onClose, onLogout, inLoginAdmin }) {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState("");

    // This useEffect hook runs every time the modal is opened
    // to check if the user is authenticated.
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/session`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                setIsAuthenticated(data.isAuthenticated);
                setUserData(data.user || null);

            } catch (error) {
                console.error('Error checking login status:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, [setIsAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            email: email,
            password: password
        };

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const data = await response.json();
                data.user.role === 'admin' && inLoginAdmin()
                setIsAuthenticated(true);
                setMessage("");
                setTimeout(onClose, 2000);
            } else {
                const errorData = await response.json();
                console.error('Login failed:', errorData);
                setMessage('Login fallido: ' + errorData.error);
            }

        } catch (error) {
            console.error('Error during login:', error);
            setMessage('Ocurrió un error durante el login');
        }
    };

    if (isLoading) {
        return <div className="loading-container">Cargando...</div>;
    }

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            setIsAuthenticated(false);
            setMessage('Sesión cerrada correctamente.');
            if (onLogout) {
                onLogout(); // ← NOTIFICA AL APP QUE SE CERRÓ SESIÓN
            }
        } catch (error) {
            setMessage('Error al cerrar sesión.', error);
        }
    };

    return (
        <div className="modal-main">
            {isAuthenticated ? (
                <div className="">
                    {userData && (
                        <div className="welcome-message">
                            <h2>Bienvenido, {userData.name} {userData.lastname}!</h2>
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
                    >
                        Iniciar Sesión
                    </button>
                    <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                        <a href="/forgot-password" style={{ color: 'var(--beige)', textDecoration: 'underline', fontSize: '0.9rem' }}>
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