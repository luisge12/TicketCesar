import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import './../styles/insert-event.css'

export default function EventForm() {
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
    const { isAuthenticated, userRole, isLoading: loading } = useAuth();

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
        if (!loading && !isAuthenticated) {
            navigate('/');
            return;
        }
        if (!loading && userRole !== 'admin') {
            alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
            navigate('/');
        }
    }, [loading, userRole, isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que la imagen se haya subido
        if (imageUploading) {
            alert('Por favor, espera a que la imagen se termine de subir.');
            return;
        }
        if (!form.image) {
            alert('Debes subir una imagen para el evento.');
            return;
        }

        // Validar longitud del excerpt
        if (form.excerpt.length > MAX_EXCERPT_LENGTH) {
            alert(`El extracto no puede exceder los ${MAX_EXCERPT_LENGTH} caracteres. Actualmente tiene ${form.excerpt.length}.`);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/create-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });
            if (response.ok) {
                alert('Evento guardado correctamente');
                setForm((prev) => ({
                    ...prev,
                    date_start: '',
                    excerpt: '',
                    description: '',
                    image: '',
                    name: '',
                    ticket_price: '',
                    category: '',
                    hour: '',
                }));
                setImagePreview('');
            } else {
                alert('Error al guardar el evento');
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
                <h2>Registrar Evento</h2>
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
                                <span>Imagen subida:</span>
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </label>

                    <label className="insert-event-label">
                        Precio de entrada
                        <input type="number" name="ticket_price" className="insert-event-input" value={form.ticket_price} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" placeholder="0.00" />
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

                    <button type="submit">Guardar Evento</button>
                </form>
            </div>
        </div>
    );
}