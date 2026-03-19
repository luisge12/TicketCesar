import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import './../styles/insert-event.css';

export default function InsertEquipo() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { isAuthenticated, userRole, isLoading: loading } = useAuth();
    
    const [equipoList, setEquipoList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loadingList, setLoadingList] = useState(true);

    const IMGBB_API_KEY = 'ea4c603101243f497005da25b031c07f';
    const [imageUploading, setImageUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        rol: '',
        descripcion: '',
        foto: '',
        orden: ''
    });

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

    // Fetch equipo list
    const fetchEquipo = async () => {
        setLoadingList(true);
        try {
            const response = await fetch(`${API_URL}/equipo`, {
                credentials: 'include'
            });
            const data = await response.json();
            setEquipoList(data);
        } catch (error) {
            console.error('Error fetching equipo:', error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        if (!loading && userRole === 'admin') {
            fetchEquipo();
        }
    }, [loading, userRole]);

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
            if (data.success) {
                setForm(prev => ({ ...prev, foto: data.data.url }));
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (imageUploading) {
            alert('Por favor, espera a que la imagen se termine de subir.');
            return;
        }

        if (!form.nombre || !form.apellido || !form.rol) {
            alert('Por favor, completa nombre, apellido y rol.');
            return;
        }

        try {
            let response;
            const url = editingId 
                ? `${API_URL}/equipo/${editingId}` 
                : `${API_URL}/equipo`;
            const method = editingId ? 'PUT' : 'POST';

            response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });

            let errorMessage = 'Error al guardar el miembro';
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (parseError) {}

            if (response.ok) {
                alert(editingId ? 'Miembro actualizado correctamente' : 'Miembro guardado correctamente');
                resetForm();
                await fetchEquipo();
            } else {
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error de conexión: ' + error.message);
        }
    };

    const handleEdit = (item) => {
        setForm({
            nombre: item.nombre,
            apellido: item.apellido,
            rol: item.rol,
            descripcion: item.descripcion || '',
            foto: item.foto || '',
            orden: item.orden !== null && item.orden !== undefined ? item.orden : ''
        });
        setImagePreview(item.foto || '');
        setEditingId(item.id);

        setTimeout(() => {
            const formContainer = document.getElementById('formulario-edicion');
            if (formContainer) {
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar a este miembro del equipo?')) return;

        try {
            const response = await fetch(`${API_URL}/equipo/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Miembro eliminado correctamente');
                await fetchEquipo();
            } else {
                alert('Error al eliminar al miembro');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    const resetForm = () => {
        setForm({
            nombre: '',
            apellido: '',
            rol: '',
            descripcion: '',
            foto: '',
            orden: ''
        });
        setImagePreview('');
        setEditingId(null);
    };

    if (loading) {
        return <div className="mainpage-insert-event"><div className="insert-event-container">Cargando...</div></div>;
    }

    return (
        <div className="mainpage-insert-event">
            {/* Left side - Equipo Registrado */}
            <div className="insert-event-container">
                <h2>Equipo Registrado</h2>
                {loadingList ? (
                    <p>Cargando...</p>
                ) : equipoList.length === 0 ? (
                    <p>No hay miembros registrados.</p>
                ) : (
                    <table className="programacion-table">
                        <thead>
                            <tr>
                                <th>Orden</th>
                                <th>Foto</th>
                                <th>Nombre</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipoList.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{item.orden !== null ? item.orden : '-'}</td>
                                    <td>
                                        {item.foto ? <img src={item.foto} alt={item.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /> : '-'}
                                    </td>
                                    <td>{item.nombre} {item.apellido}</td>
                                    <td>{item.rol}</td>
                                    <td>
                                        <button onClick={() => handleEdit(item)} className="edit-btn">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="delete-btn">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Right side - Form */}
            <div className="insert-event-container" id="formulario-edicion">
                <h2>{editingId ? 'Editar Miembro' : 'Agregar Miembro'}</h2>
                <form onSubmit={handleSubmit} className="insert-event-form">
                    <label className="insert-event-label">
                        Nombre *
                        <input 
                            type="text" 
                            name="nombre" 
                            className="insert-event-input" 
                            value={form.nombre} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>

                    <label className="insert-event-label">
                        Apellido *
                        <input 
                            type="text" 
                            name="apellido" 
                            className="insert-event-input" 
                            value={form.apellido} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>

                    <label className="insert-event-label">
                        Rol *
                        <input 
                            type="text" 
                            name="rol" 
                            className="insert-event-input" 
                            value={form.rol} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>

                    <label className="insert-event-label">
                        Orden de aparición (número)
                        <input 
                            type="number" 
                            name="orden" 
                            className="insert-event-input" 
                            value={form.orden} 
                            onChange={handleChange} 
                            onWheel={(e) => e.target.blur()}
                            placeholder="1, 2, 3..."
                        />
                    </label>

                    <label className="insert-event-label">
                        Descripción
                        <textarea 
                            name="descripcion" 
                            className="insert-event-input" 
                            value={form.descripcion} 
                            onChange={handleChange}
                            rows="4"
                        />
                    </label>

                    <label className="insert-event-label">
                        Fotografía
                        <input
                            type="file"
                            className="insert-event-input"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={imageUploading}
                        />
                        {imageUploading && <span className="insert-event-hint">Subiendo imagen...</span>}
                        {imagePreview && (
                            <div className="insert-event-preview">
                                <span>Imagen actual:</span>
                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', borderRadius: '8px' }} />
                            </div>
                        )}
                    </label>

                    <div className="form-buttons">
                        <button type="submit" disabled={imageUploading}>{editingId ? 'Actualizar' : 'Guardar'}</button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="cancel-btn">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
