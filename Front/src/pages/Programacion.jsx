import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config.js';
import '../styles/programacion.css';

const MESES = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
];

export default function Programacion() {
    const [programacion, setProgramacion] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [sortOrder, setSortOrder] = useState('asc');

    const fetchProgramacion = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch from programacion-simple endpoint
            const response = await fetch(`${API_URL}/programacion-simple`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            // Filter by selected month and year
            const filteredData = data.filter(item => {
                if (!item.fecha) return false;
                const itemDate = new Date(item.fecha);
                return itemDate.getMonth() + 1 === mes && itemDate.getFullYear() === anio;
            });
            
            // Sort by fecha and hora based on sortOrder
            filteredData.sort((a, b) => {
                const dateA = new Date(`${a.fecha.split('T')[0]}T${a.hora}`);
                const dateB = new Date(`${b.fecha.split('T')[0]}T${b.hora}`);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
            
            setProgramacion(filteredData);
        } catch (error) {
            console.error('Error fetching programacion:', error);
            setProgramacion([]);
        } finally {
            setLoading(false);
        }
    }, [mes, anio, sortOrder]);

    useEffect(() => {
        fetchProgramacion();
    }, [fetchProgramacion]);

    const cambiarMes = (direccion) => {
        if (direccion === 'anterior') {
            if (mes === 1) {
                setMes(12);
                setAnio(anio - 1);
            } else {
                setMes(mes - 1);
            }
        } else {
            if (mes === 12) {
                setMes(1);
                setAnio(anio + 1);
            } else {
                setMes(mes + 1);
            }
        }
    };

    const getMesNombre = (mesValor) => {
        const mesObj = MESES.find(m => m.valor === mesValor);
        return mesObj ? mesObj.nombre : '';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <main className="programacion-page">
            <nav className="blog-nav" style={{ background: 'none', color: 'var(--black)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button className="blog-nav-btn" onClick={() => window.location.href = '/'}>Menú Inicial</button>
                    <button className="blog-nav-btn" onClick={() => window.location.href = '/visitanos'}>Visítanos</button>
                </div>
            </nav>

            <h1>Programación del Teatro</h1>

            <div className="programacion-selector">
                <button className="nav-btn" onClick={() => cambiarMes('anterior')}> Anterior </button>
                <span className="mes-año">{getMesNombre(mes)} {anio}</span>
                <button className="nav-btn" onClick={() => cambiarMes('siguiente')}> Siguiente </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Ordenar por fecha: </label>
                <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)} 
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="asc">Más antiguos primero</option>
                    <option value="desc">Más recientes primero</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">Cargando programación...</div>
            ) : programacion.length === 0 ? (
                <div className="no-programacion">
                    <p>No hay programación programada para {getMesNombre(mes)} {anio}.</p>
                </div>
            ) : (
                <div className="programacion-grid">
                    {programacion.map(evento => (
                        <div key={evento.id} className="programacion-card">
                            <div className="programacion-content">
                                <h2 className="programacion-nombre">{evento.nombre}</h2>
                                <p className="programacion-fecha">{formatDate(evento.fecha)} {evento.hora}</p>
                                <p className="programacion-categoria">{evento.categoria}</p>
                                {evento.compania && (
                                    <p className="programacion-agrupacion">{evento.compania}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

