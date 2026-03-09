import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config.js';
import './../styles/insert-event.css';

const CATEGORIAS = [
    { value: 'Danza', label: 'Danza' },
    { value: 'Musica', label: 'Música' },
    { value: 'Teatro', label: 'Teatro' },
    { value: 'Grados', label: 'Grados' },
    { value: 'Recorridos', label: 'Recorridos' },
    { value: 'Otro', label: 'Otro' }
];

export default function InsertProgramacion() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [programacionList, setProgramacionList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loadingList, setLoadingList] = useState(true);

    const [form, setForm] = useState({
        nombre: '',
        categoria: '',
        compania: '',
        fecha: '',
        hora: ''
    });

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
    }, []);

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

    // Fetch programacion list
    useEffect(() => {
        const fetchProgramacion = async () => {
            setLoadingList(true);
            try {
                const response = await fetch(`${API_URL}/programacion-simple`, {
                    credentials: 'include'
                });
                const data = await response.json();
                setProgramacionList(data);
            } catch (error) {
                console.error('Error fetching programacion:', error);
            } finally {
                setLoadingList(false);
            }
        };

        if (!loading && userRole === 'admin') {
            fetchProgramacion();
        }
    }, [loading, userRole]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.nombre || !form.categoria || !form.fecha || !form.hora) {
            alert('Por favor, completa todos los campos requeridos');
            return;
        }

        try {
            let response;
            const url = editingId 
                ? `${API_URL}/programacion-simple/${editingId}` 
                : `${API_URL}/programacion-simple`;
            const method = editingId ? 'PUT' : 'POST';

            console.log('Enviando datos:', { url, method, body: form });

            response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });

            console.log('Respuesta del servidor:', response.status, response.statusText);

            // Try to get error details from response
            let errorMessage = 'Error al guardar la programación';
            try {
                const errorData = await response.json();
                console.log('Datos de error:', errorData);
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (parseError) {
                console.error('Error al parsear respuesta de error:', parseError);
            }

            if (response.ok) {
                alert(editingId ? 'Programación actualizada correctamente' : 'Programación guardada correctamente');
                resetForm();
                // Refresh list
                const listResponse = await fetch(`${API_URL}/programacion-simple`, {
                    credentials: 'include'
                });
                const data = await listResponse.json();
                setProgramacionList(data);
            } else {
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error de conexión: ' + error.message);
        }
    };

    const handleEdit = (item) => {
        // Format date for input type="date" (YYYY-MM-DD)
        let formattedFecha = '';
        if (item.fecha) {
            const date = new Date(item.fecha);
            if (!isNaN(date.getTime())) {
                formattedFecha = date.toISOString().split('T')[0];
            }
        }
        
        setForm({
            nombre: item.nombre,
            categoria: item.categoria,
            compania: item.compania || '',
            fecha: formattedFecha,
            hora: item.hora
        });
        setEditingId(item.id);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta programación?')) return;

        try {
            const response = await fetch(`${API_URL}/programacion-simple/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Programación eliminada correctamente');
                // Refresh list
                const listResponse = await fetch(`${API_URL}/programacion-simple`, {
                    credentials: 'include'
                });
                const data = await listResponse.json();
                setProgramacionList(data);
            } else {
                alert('Error al eliminar la programación');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    const resetForm = () => {
        setForm({
            nombre: '',
            categoria: '',
            compania: '',
            fecha: '',
            hora: ''
        });
        setEditingId(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    if (loading) {
        return <div className="mainpage-insert-event"><div className="insert-event-container">Cargando...</div></div>;
    }

    return (
        <div className="mainpage-insert-event">
            {/* Left side - Programación Registrada */}
            <div className="insert-event-container">
                <h2>Programación Registrada</h2>
                {loadingList ? (
                    <p>Cargando...</p>
                ) : programacionList.length === 0 ? (
                    <p>No hay programación registrada.</p>
                ) : (
                    <table className="programacion-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Compañía</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programacionList.map(item => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>{item.categoria}</td>
                                    <td>{item.compania || '-'}</td>
                                    <td>{formatDate(item.fecha)}</td>
                                    <td>{item.hora}</td>
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
            <div className="insert-event-container">
                <h2>{editingId ? 'Editar Programación' : 'Agregar Programación'}</h2>
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
                        Categoría *
                        <select
                            name="categoria"
                            className="insert-event-input"
                            value={form.categoria}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione una categoría</option>
                            {CATEGORIAS.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="insert-event-label">
                        Compañía
                        <input 
                            type="text" 
                            name="compania" 
                            className="insert-event-input" 
                            value={form.compania} 
                            onChange={handleChange} 
                            placeholder="Nombre de la compañía o grupo"
                        />
                    </label>

                    <label className="insert-event-label">
                        Fecha *
                        <input 
                            type="date" 
                            name="fecha" 
                            className="insert-event-input" 
                            value={form.fecha} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>

                    <label className="insert-event-label">
                        Hora *
                        <input 
                            type="time" 
                            name="hora" 
                            className="insert-event-input" 
                            value={form.hora} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>

                    <div className="form-buttons">
                        <button type="submit">{editingId ? 'Actualizar' : 'Guardar'}</button>
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
