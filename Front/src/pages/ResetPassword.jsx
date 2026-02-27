import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Enlace de recuperación inválido. Por favor solicita uno nuevo.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setMessage('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => {
                    navigate('/'); // Redirigir al inicio para iniciar sesión
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Ocurrió un error al restablecer la contraseña.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setStatus('error');
            setMessage('Error de conexión con el servidor.');
        }
    };

    if (!token) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--beige)' }}>Error</h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--beige)' }}>{message}</p>
                <button
                    onClick={() => navigate('/')}
                    style={{ marginTop: '2rem', padding: '0.8rem 1.5rem', background: 'var(--black)', color: 'var(--beige)', border: '1px solid var(--beige)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', padding: '2rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.8)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--beige)', textAlign: 'center' }}>
                    Nueva Contraseña
                </h2>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#4ade80', marginBottom: '1.5rem', fontWeight: 'bold' }}>{message}</p>
                        <p style={{ color: 'var(--beige)' }}>Redirigiendo al inicio...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="password" style={{ color: 'var(--beige)', fontWeight: 'bold' }}>Nueva Contraseña:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                                style={{
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--beige)',
                                    background: 'var(--black)',
                                    color: 'var(--beige)'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="confirmPassword" style={{ color: 'var(--beige)', fontWeight: 'bold' }}>Confirmar Contraseña:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                                style={{
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--beige)',
                                    background: 'var(--black)',
                                    color: 'var(--beige)'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.8rem',
                                background: 'var(--beige)',
                                color: 'var(--black)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {status === 'loading' ? 'Guardando...' : 'Restablecer Contraseña'}
                        </button>

                        {(message && status !== 'success') && (
                            <p style={{ color: '#ff6b6b', marginTop: '1rem', textAlign: 'center' }}>{message}</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
