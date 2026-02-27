import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config.js';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verificando tu correo electrónico...');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No se encontró ningún token de verificación en la URL.');
            return;
        }

        const verifyEmailToken = async () => {
            try {
                const response = await fetch(`${API_URL}/verify-email?token=${token}`, {
                    method: 'GET',
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Error al verificar el correo.');
                }
            } catch (error) {
                console.error('Error verifying email:', error);
                setStatus('error');
                setMessage('Error de conexión al intentar verificar el correo.');
            }
        };

        verifyEmailToken();
    }, [token]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.8)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxSizing: 'border-box' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--beige)' }}>
                    {status === 'success' ? '¡Cuenta verificada con éxito!' : 'Verificación de Correo'}
                </h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--beige)', marginBottom: '2rem' }}>
                    {message}
                </p>
                {(status === 'success' || status === 'error') && (
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '0.8rem 1.5rem', background: 'var(--black)', color: 'var(--beige)', border: '1px solid var(--beige)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Ir al Menú Principal
                    </button>
                )}
            </div>
        </div>
    );
}
