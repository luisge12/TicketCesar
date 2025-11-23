import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../styles/insert-event.css'

export default function EventForm() {
    const [imagePreview, setImagePreview] = useState('');
    const IMGBB_API_KEY = 'ea4c603101243f497005da25b031c07f';
    const [imageUploading, setImageUploading] = useState(false);
    // Subir imagen a ImgBB y guardar la URL en form.image
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageUploading(true);
        setImagePreview('');
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            console.log('ImgBB response:', data);
            console.log('result:', data.data.url);
            if (data.success) {
                setForm(prev => ({ ...prev, image: data.data.url }));
                setImagePreview(data.data.url);
            } else {
                alert('Error al subir la imagen a ImgBB');
            }
        } catch (error) {
            console.error('ImgBB upload error:', error);
            alert('Error de conexión con ImgBB');
        }
        setImageUploading(false);
    };
    const location = useLocation();
    const navigate = useNavigate();
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
                    //console.log('Usuario autenticado con rol:', data.user.role);
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
        //console.log('Checking auth status...', userRole);

        checkAuthStatus();
    }, [userRole]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // not authenticated -> go to main page
            navigate('/');
            return;
        }
        if (!loading && userRole !== 'admin') {
            alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
            navigate('/');
        }
    }, [loading, userRole, isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        //console.log('Submitting form:', form); // Para debug
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
                    <input type="text" name="name" className="insert-event-input" placeholder="Nombre del evento" value={form.name} onChange={handleChange} required />
                    <textarea name="description" className="insert-event-input" placeholder="Descripción" value={form.description} onChange={handleChange} required />
                    <input type="date" name="date_start" className="insert-event-input" placeholder="Fecha inicio" value={form.date_start} onChange={handleChange} required />
                    <input
                        type="file"
                        name="image"
                        className="insert-event-input"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                    />
                    {imageUploading && <span style={{ fontSize: '0.9rem', color: 'orange' }}>Subiendo imagen...</span>}
                    {imagePreview && (
                        <div style={{ marginTop: '0rem' }}>
                            <span style={{ fontSize: '0.9rem' }}>Imagen subida:</span>
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--grey)', display: 'block', marginTop: '0.5rem' }} />
                        </div>
                    )}
                    
                    <input type="number" name="ticket_price" className="insert-event-input" placeholder="Precio de entrada" value={form.ticket_price} onChange={handleChange} min="0" step="0.01" />
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                    >
                        <option 
                        className='insert-event-option'
                        value="" disabled>Seleccione una categoría</option>
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