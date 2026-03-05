import { useState } from 'react';
import { API_URL } from '../config.js';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.error || 'Ocurrió un error al procesar tu solicitud.');
            }
        } catch (error) {
            console.error('Error in forgot password:', error);
            setStatus('error');
            setMessage('Error de conexión con el servidor.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', padding: '2rem', marginTop:'5rem'}}>
            <div style={{ background: 'rgba(0,0,0,0.8)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--beige)', textAlign: 'center' }}>
                    Recuperar Contraseña
                </h2>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--beige)', marginBottom: '1.5rem' }}>{message}</p>
                        <a href="/" style={{ color: 'var(--beige)', textDecoration: 'underline', fontWeight: 'bold' }}>
                            Volver al inicio
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ color: 'var(--beige)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="email" style={{ color: 'var(--beige)', fontWeight: 'bold' }}>Correo Electrónico:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
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
                                marginTop: '1rem',
                                padding: '0.8rem',
                                background: 'var(--beige)',
                                color: 'var(--black)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {status === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>

                        {status === 'error' && (
                            <p style={{ color: '#ff6b6b', marginTop: '1rem', textAlign: 'center' }}>{message}</p>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <a href="/" style={{ color: 'var(--beige)', textDecoration: 'underline', fontSize: '0.9rem' }}>
                                Volver al inicio
                            </a>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
