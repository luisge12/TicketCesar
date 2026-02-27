import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../config.js';
import './../styles/insert-event.css'

export default function EditEvent() {
    const MAX_EXCERPT_LENGTH = 240; // Límite de caracteres para el excerpt

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
    const { id } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        attendance: '',
        date_end: '',
        date_start: '',
        description: '',
        excerpt: '',
        id: '',
        image: '',
        is_active: false,
        name: '',
        ticket_price: '',
        tickets_sold: '',
        category: '',
        hour: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/session`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                setIsAuthenticated(data.isAuthenticated);

                if (data.isAuthenticated && data.user) {
                    setUserRole(data.user.role);
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

        checkAuthStatus();
    }, []); // Eliminada dependencia de userRole para evitar bucles

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/');
            return;
        }
        if (!loading && userRole !== 'admin') {
            alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
            navigate('/');
        }
    }, [loading, userRole, isAuthenticated, navigate]);

    // Fetch existing event data
    useEffect(() => {
        if (!id) return;
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${API_URL}/event/${id}`);
                if (response.ok) {
                    const data = await response.json();

                    // Format dates for input type="date"
                    const formattedDateStart = data.date_start ? data.date_start.split('T')[0] : '';

                    setForm({
                        attendance: data.attendance || '',
                        date_end: data.date_end || '',
                        date_start: formattedDateStart,
                        description: data.description || '',
                        excerpt: data.excerpt || '',
                        id: data.id || '',
                        image: data.image || '',
                        is_active: data.is_active || false,
                        name: data.name || '',
                        ticket_price: data.ticket_price || '',
                        tickets_sold: data.tickets_sold || '',
                        category: data.category || '',
                        hour: data.hour || ''
                    });

                    if (data.image) {
                        setImagePreview(data.image);
                    }
                } else {
                    alert('Error al obtener los datos del evento');
                }
            } catch (error) {
                console.error('Error fetching event data:', error);
            }
        };

        fetchEvent();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que la imagen se haya subido
        if (imageUploading) {
            alert('Por favor, espera a que la imagen se termine de subir.');
            return;
        }
        // image uploading check is kept, but it's okay if it's already uploaded (i.e., !form.image is only an error if there wasn't an old one)
        if (!form.image && !imagePreview) {
            alert('Debes tener una imagen para el evento.');
            return;
        }

        // Validar longitud del excerpt
        if (form.excerpt.length > MAX_EXCERPT_LENGTH) {
            alert(`El extracto no puede exceder los ${MAX_EXCERPT_LENGTH} caracteres. Actualmente tiene ${form.excerpt.length}.`);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/edit-event/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });
            if (response.ok) {
                alert('Evento actualizado correctamente');
                navigate('/');
            } else {
                alert('Error al actualizar el evento');
            }
        } catch (error) {
            alert('Error de conexión', error);
        }
    };

    // Determinar clase para el contador según la longitud
    const getCounterClass = () => {
        const len = form.excerpt.length;
        if (len > MAX_EXCERPT_LENGTH) return 'counter-exceeded';
        if (len >= MAX_EXCERPT_LENGTH - 20) return 'counter-warning'; // opcional
        return '';
    };

    return (
        <div className="mainpage-insert-event">
            <div className="insert-event-container">
                <h2>Editar Evento</h2>
                <form onSubmit={handleSubmit} className="insert-event-form">
                    <label className="insert-event-label">
                        Nombre del evento
                        <input type="text" name="name" className="insert-event-input" value={form.name} onChange={handleChange} required />
                    </label>

                    <label className="insert-event-label">
                        Extracto (resumen corto)
                        <textarea
                            name="excerpt"
                            className="insert-event-input"
                            value={form.excerpt}
                            onChange={handleChange}
                            required
                            maxLength={MAX_EXCERPT_LENGTH} // Limita la entrada a 140 caracteres
                            placeholder={`Máx. ${MAX_EXCERPT_LENGTH} caracteres`}
                        />
                        <div className={`excerpt-counter ${getCounterClass()}`}>
                            {form.excerpt.length} / {MAX_EXCERPT_LENGTH} caracteres
                            {form.excerpt.length > MAX_EXCERPT_LENGTH && (
                                <span className="exceeded-message"> (excede el límite)</span>
                            )}
                        </div>
                    </label>

                    <label className="insert-event-label">
                        Descripción
                        <textarea name="description" className="insert-event-input" value={form.description} onChange={handleChange} required />
                    </label>

                    <label className="insert-event-label">
                        Fecha de inicio
                        <input type="date" name="date_start" className="insert-event-input" value={form.date_start} onChange={handleChange} required />
                    </label>

                    <label className="insert-event-label">
                        Hora de inicio
                        <input type="time" name="hour" className="insert-event-input" value={form.hour} onChange={handleChange} required />
                    </label>

                    <label className="insert-event-label">
                        Imagen del evento
                        <input
                            type="file"
                            name="image"
                            className="insert-event-input"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={imageUploading}
                        />
                        {imageUploading && <span className="insert-event-hint">Subiendo imagen...</span>}
                        {imagePreview && (
                            <div className="insert-event-preview">
                                <span>Imagen actual:</span>
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </label>

                    <label className="insert-event-label">
                        Precio de entrada
                        <input type="number" name="ticket_price" className="insert-event-input" value={form.ticket_price} onChange={handleChange} min="0" step="0.01" placeholder="0.00" />
                    </label>

                    <label className="insert-event-label">
                        Categoría
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="insert-event-input"
                            required
                        >
                            <option value="" disabled>Seleccione una categoría</option>
                            <option value="Danza">Danza</option>
                            <option value="Musica">Música</option>
                            <option value="Teatro">Teatro</option>
                            <option value="Grados">Grados</option>
                            <option value="Recorridos">Recorridos</option>
                        </select>
                    </label>

                    <button type="submit">Actualizar Evento</button>
                </form>
            </div>
        </div>
    );
}