import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './../styles/insert-event.css'

export default function EventForm() {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [form, setForm] = useState({
        attendance: '',
        date_end: '',
        date_start: '',
        description: '',
        id: '',
        image: '',
        is_active: false,
        name: '',
        ticket_price: '',
        tickets_sold: '',
        category: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

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
                    console.log('Usuario autenticado con rol:', data.user.role);
                } else {
                    setUserRole(null);
                }
                
            } catch (error) {
                console.error('Error verificando autenticación:', error);
                setIsAuthenticated(false);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };
        console.log('Checking auth status...', userRole);

        checkAuthStatus();
    }, [userRole]);

    useEffect(() => {
        if (!loading && userRole !== 'admin') {
            alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
            window.location.href = './';
        }
    }, [loading, userRole]);

    const handleSubmit = async (e) => {
        console.log('Submitting form:', form); // Para debug
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/create-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (response.ok) {
                alert('Evento guardado correctamente');
                setForm({
                    date_start: '',
                    description: '',
                    image: '',
                    name: '',
                    ticket_price: '',
                    category: '',
                });
            } else {
                alert('Error al guardar el evento');
            }
        } catch (error) {
            alert('Error de conexión', error);
        }
    };



    return (
        <div className="mainpage-insert-event">
            <div className="insert-event-container">
                <h2>Registrar Evento</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 500 }}>
                    <input type="text" name="name" placeholder="Nombre del evento" value={form.name} onChange={handleChange} required />
                    <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} required />
                    <input type="date" name="date_start" placeholder="Fecha inicio" value={form.date_start} onChange={handleChange} required />
                    <input type="text" name="image" placeholder="URL de la imagen" value={form.image} onChange={handleChange} />
                    <input type="number" name="ticket_price" placeholder="Precio de entrada" value={form.ticket_price} onChange={handleChange} min="0" step="0.01" />
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Seleccione una categoría</option>
                        <option value="Danza">Danza</option>
                        <option value="Musica">Música</option>
                        <option value="Teatro">Teatro</option>
                        <option value="Grados">Grados</option>
                        <option value="Recorridos">Recorridos</option>
                    </select>
                    <button type="submit">Guardar Evento</button>
                </form>
            </div>
        </div>
    );
}