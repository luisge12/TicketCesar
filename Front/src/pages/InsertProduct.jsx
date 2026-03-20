import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import './../styles/insert-event.css';

export default function InsertProduct() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { isAuthenticated, userRole, isLoading: loading } = useAuth();
    
    const [productList, setProductList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loadingList, setLoadingList] = useState(true);

    const IMGBB_API_KEY = 'ea4c603101243f497005da25b031c07f';
    const [imageUploading, setImageUploading] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        cantidad: '',
        imagenes: []
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
            alert('Acceso denegado. Solo administradores.');
            navigate('/');
        }
    }, [loading, userRole, isAuthenticated, navigate]);

    const fetchProducts = async () => {
        setLoadingList(true);
        try {
            const response = await fetch(`${API_URL}/products`, { credentials: 'include' });
            const data = await response.json();
            setProductList(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        if (!loading && userRole === 'admin') {
            fetchProducts();
        }
    }, [loading, userRole]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setImageUploading(true);
        
        try {
            const newUrls = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    newUrls.push(data.data.url);
                } else {
                    console.error("ImgBB error:", data);
                }
            }
            if (newUrls.length > 0) {
                setForm(prev => ({ ...prev, imagenes: [...prev.imagenes, ...newUrls] }));
            }
        } catch (error) {
            console.error('ImgBB upload error:', error);
            alert('Error al conectar con ImgBB');
        }
        setImageUploading(false);
    };

    const removeImage = (indexToRemove) => {
        setForm(prev => ({
            ...prev,
            imagenes: prev.imagenes.filter((_, idx) => idx !== indexToRemove)
        }));
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
            alert('Por favor, espera a que las imágenes se suban.');
            return;
        }

        if (!form.nombre || form.precio === '') {
            alert('Por favor, completa nombre y precio.');
            return;
        }

        try {
            const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });

            if (response.ok) {
                alert(editingId ? 'Producto actualizado' : 'Producto guardado');
                resetForm();
                await fetchProducts();
            } else {
                let err = await response.json();
                alert(err.error || 'Error al guardar el producto');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    };

    const handleEdit = (item) => {
        setForm({
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            precio: item.precio || '',
            cantidad: item.cantidad !== null ? item.cantidad : '',
            imagenes: item.imagenes || []
        });
        setEditingId(item.id);

        setTimeout(() => {
            document.getElementById('formulario-edicion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                alert('Producto eliminado');
                await fetchProducts();
            } else {
                alert('Error al eliminar');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    };

    const resetForm = () => {
        setForm({
            nombre: '',
            descripcion: '',
            precio: '',
            cantidad: '',
            imagenes: []
        });
        setEditingId(null);
    };

    if (loading) return <div className="mainpage-insert-event"><div className="insert-event-container">Cargando...</div></div>;

    return (
        <div className="mainpage-insert-event">
            <div className="insert-event-container">
                <h2>Inventario del Kiosko</h2>
                {loadingList ? (
                    <p>Cargando...</p>
                ) : productList.length === 0 ? (
                    <p>No hay productos registrados.</p>
                ) : (
                    <table className="programacion-table">
                        <thead>
                            <tr>
                                <th>IMG</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productList.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        {item.imagenes && item.imagenes.length > 0 ? 
                                            <img src={item.imagenes[0]} alt="preview" style={{width:'40px', height:'40px', borderRadius:'4px', objectFit:'cover'}}/> 
                                            : '-'}
                                    </td>
                                    <td>{item.nombre}</td>
                                    <td>${Number(item.precio).toFixed(2)}</td>
                                    <td style={{fontWeight:'bold', color: item.cantidad > 0 ? 'green' : 'red'}}>{item.cantidad}</td>
                                    <td>
                                        <button onClick={() => handleEdit(item)} className="edit-btn">Editar</button>
                                        <button onClick={() => handleDelete(item.id)} className="delete-btn">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="insert-event-container" id="formulario-edicion">
                <h2>{editingId ? 'Editar Producto' : 'Agregar Producto'}</h2>
                <form onSubmit={handleSubmit} className="insert-event-form">
                    <label className="insert-event-label">
                        Nombre del Producto *
                        <input type="text" name="nombre" className="insert-event-input" value={form.nombre} onChange={handleChange} required />
                    </label>

                    <label className="insert-event-label">
                        Precio ($) *
                        <input type="number" name="precio" className="insert-event-input" value={form.precio} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" required />
                    </label>

                    <label className="insert-event-label">
                        Cantidad en Stock (Inventario)
                        <input type="number" name="cantidad" className="insert-event-input" value={form.cantidad} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" />
                    </label>

                    <label className="insert-event-label">
                        Descripción
                        <textarea name="descripcion" className="insert-event-input" value={form.descripcion} onChange={handleChange} rows="4" />
                    </label>

                    <label className="insert-event-label">
                        Galería de Imágenes (puedes seleccionar varias a la vez)
                        <input type="file" className="insert-event-input" accept="image/*" multiple onChange={handleImageUpload} disabled={imageUploading} />
                        {imageUploading && <span className="insert-event-hint" style={{color:'blue'}}>Subiendo imágenes... espera por favor.</span>}
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {form.imagenes.map((url, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                    <img src={url} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(idx)}
                                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    </label>

                    <div className="form-buttons">
                        <button type="submit" disabled={imageUploading}>{editingId ? 'Actualizar Producto' : 'Guardar Producto'}</button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="cancel-btn">Cancelar</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
