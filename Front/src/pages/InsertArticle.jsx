import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../styles/insert-event.css'

export default function InsertArticle() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const IMGBB_API_KEY = 'ea4c603101243f497005da25b031c07f';

    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        category: '',
        date: '',
        autor: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('key', IMGBB_API_KEY);
        try {
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data && data.success) {
                setForm(prev => ({ ...prev, image: data.data.url }));
            } else {
                alert('Error al subir la imagen');
            }
        } catch (err) {
            console.error('Image upload error:', err);
            alert('Error al subir la imagen');
        }
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
    }, []);

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
        e.preventDefault();
        const payload = {
            title: form.title,
            excerpt: form.excerpt,
            content: form.content,
            image: form.image,
            category: form.category,
            autor: form.autor,
            date: form.date
        };

        console.log('Submitting article payload:', payload);

        try {
            const response = await fetch('http://localhost:3000/create-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            if (response.ok) {
                alert('Artículo guardado correctamente');
                setForm({ title: '', excerpt: '', content: '', image: '', category: '', autor: '', date: '' });
            } else {
                const text = await response.text().catch(() => null);
                console.error('Create-article response not OK', response.status, text);
                alert('Error al guardar el artículo');
            }
        } catch (error) {
            alert('Error de conexión');
            console.error(error);
        }
    };

    return (
        <div className="mainpage-insert-event">
            <div className="insert-event-container">
                <h2>Insertar Artículo</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 700 }}>
                    <input type="text" name="title" placeholder="Título" value={form.title} onChange={handleChange} required />
                    <input type="text" name="excerpt" placeholder="Extracto" value={form.excerpt} onChange={handleChange} required />
                    <textarea name="content" placeholder="Contenido" value={form.content} onChange={handleChange} required />
                    <input type="file" name="image" accept="image/*" onChange={handleImageUpload} />
                    <select name="category" value={form.category} onChange={handleChange} required>
                        <option value="" disabled>Seleccione una categoría</option>
                        <option value="Articulos">Artículos</option>
                        <option value="Reportajes">Reportajes</option>
                        <option value="Critica">Crítica</option>
                        <option value="Entrevistas">Entrevistas</option>
                        <option value="Noticias">Noticias</option>
                    </select>
                    <input type='date' name='date' placeholder='Fecha' value={form.date} onChange={handleChange} />
                    <input type="text" name="autor" placeholder="Autor" value={form.autor} onChange={handleChange} />
                    
                    <button type="submit">Guardar Artículo</button>
                </form>
            </div>
        </div>
    );
}
