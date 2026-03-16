import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import './../styles/insert-event.css'

export default function EditArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const IMGBB_API_KEY = 'ea4c603101243f497005da25b031c07f';

    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        content: [{ text: '', subtitle: '' }],
        images: [],
        category: '',
        date: '',
        autor: ''
    });

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
    }, []);

    // Fetch existing article data
    useEffect(() => {
        if (!id) return;

        const fetchArticle = async () => {
            try {
                const response = await fetch(`${API_URL}/articles/${id}`);
                const data = await response.json();
                if (data && !data.error) {
                    setForm({
                        title: data.title || '',
                        excerpt: data.excerpt || '',
                        content: Array.isArray(data.content) 
                            ? data.content.map(c => typeof c === 'object' ? { text: c.text || '', subtitle: c.subtitle || '' } : { text: c, subtitle: '' }) 
                            : [{ text: data.content || '', subtitle: '' }],
                        images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
                        category: data.cathegory || data.category || '',
                        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
                        autor: data.author || ''
                    });
                } else {
                    alert('Artículo no encontrado');
                    navigate('/blog');
                }
            } catch (err) {
                console.error('Error fetching article:', err);
                alert('Error al cargar el artículo');
            }
        };

        fetchArticle();
    }, [id, navigate]);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleParagraphChange = (index, field, value) => {
        const newContent = [...form.content];
        newContent[index] = { ...newContent[index], [field]: value };
        setForm({ ...form, content: newContent });
    };

    const addParagraph = () => {
        setForm({ ...form, content: [...form.content, { text: '', subtitle: '' }] });
    };

    const removeParagraph = (index) => {
        if (form.content.length <= 1) return;
        setForm({ ...form, content: form.content.filter((_, i) => i !== index) });
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        for (const file of files) {
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
                    setForm(prev => ({ ...prev, images: [...prev.images, data.data.url] }));
                } else {
                    alert('Error al subir una de las imágenes');
                }
            } catch (err) {
                console.error('Image upload error:', err);
                alert('Error al subir una de las imágenes');
            }
        }
    };

    const removeImage = (index) => {
        setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title: form.title,
            excerpt: form.excerpt,
            content: form.content,
            images: form.images,
            category: form.category,
            author: form.autor,
            date: form.date
        };

        try {
            const response = await fetch(`${API_URL}/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            if (response.ok) {
                alert('Artículo actualizado correctamente');
                navigate(`/blog/${id}`);
            } else {
                const text = await response.text().catch(() => null);
                console.error('Update-article response not OK', response.status, text);
                alert('Error al actualizar el artículo');
            }
        } catch (error) {
            alert('Error de conexión');
            console.error(error);
        }
    };

    if (loading) return <div className="mainpage-insert-event">Cargando...</div>;

    return (
        <div className="mainpage-insert-event">
            <div className="insert-event-container">
                <h2>Editar Artículo</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: 700 }}>
                    <div className="form-group">
                        <label>Título</label>
                        <input type="text" name="title" className="insert-event-input" placeholder="Título" value={form.title} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Extracto (Resumen corto)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <input 
                                type="text" 
                                name="excerpt" 
                                className="insert-event-input" 
                                placeholder="Extracto" 
                                value={form.excerpt} 
                                onChange={handleChange} 
                                required 
                                maxLength={300}
                            />
                            <span style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'right', color: form.excerpt.length >= 300 ? '#ef4444' : 'inherit' }}>
                                {form.excerpt.length}/300 caracteres
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contenido (Párrafos)</label>
                        {form.content.map((paragraph, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Bloque {index + 1}</label>
                                    <button type="button" onClick={() => removeParagraph(index)} style={{ padding: '2px 8px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Borrar Bloque</button>
                                </div>
                                <input 
                                    type="text"
                                    className="insert-event-input"
                                    placeholder="Subtítulo (Opcional)" 
                                    value={paragraph.subtitle} 
                                    onChange={(e) => handleParagraphChange(index, 'subtitle', e.target.value)} 
                                />
                                <textarea 
                                    className="insert-event-input"
                                    placeholder={`Contenido del párrafo ${index + 1}`} 
                                    value={paragraph.text} 
                                    onChange={(e) => handleParagraphChange(index, 'text', e.target.value)} 
                                    required 
                                    style={{ flex: 1, minHeight: '120px' }}
                                />
                            </div>
                        ))}
                        <button type="button" onClick={addParagraph} style={{ width: 'fit-content', background: 'var(--blue)', color: 'var(--black)', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: '600' }}>+ Agregar Párrafo</button>
                    </div>

                    <div className="form-group">
                        <label>Imágenes de Galería</label>
                        <input type="file" name="image" className="insert-event-input" accept="image/*" multiple onChange={handleImageUpload} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                            {form.images.map((url, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <img src={url} alt={`Upload ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}>X</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Categoría</label>
                        <select name="category" className="insert-event-input" value={form.category} onChange={handleChange} required>
                            <option value="" disabled>Seleccione una categoría</option>
                            <option value="Articulos">Artículos</option>
                            <option value="Reportajes">Reportajes</option>
                            <option value="Critica">Crítica</option>
                            <option value="Entrevistas">Entrevistas</option>
                            <option value="Noticias">Noticias</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Fecha</label>
                        <input type='date' name='date' className="insert-event-input" placeholder='Fecha' value={form.date} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Autor</label>
                        <input type="text" name="autor" className="insert-event-input" placeholder="Autor" value={form.autor} onChange={handleChange} required />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" style={{ flex: 1, padding: '1rem', background: 'var(--grey)', color: 'var(--black)', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', marginTop: '1rem' }}>Actualizar Artículo</button>
                        <button type="button" onClick={() => navigate('/blog')} style={{ flex: 1, padding: '1rem', background: '#e2e8f0', color: 'var(--black)', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', marginTop: '1rem' }}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
