import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/insert-article.css';

export default function InsertArticle() {
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    images: '',
    category: '',
    date: '',
    author: '',
    content: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    let imageUrl = form.images;
    try {
      // Si hay imagen seleccionada, subir a ImgBB
      if (imageFile) {
        const apiKey = 'ea4c603101243f497005da25b031c07f'; // Reemplaza por tu API key
        const formData = new FormData();
        formData.append('image', imageFile);
        const resImg = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        });
        const imgData = await resImg.json();
        if (imgData && imgData.data && imgData.data.url) {
          imageUrl = imgData.data.url;
        } else {
          throw new Error('Error al subir la imagen');
        }
      }
      // Enviar el artículo con la URL de la imagen
      const res = await fetch('http://localhost:3000/insert-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, images: imageUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setForm({
          title: '', excerpt: '', images: '', category: '', date: '', author: '', content: ''
        });
        setImageFile(null);
        setImagePreview('');
      } else {
        setError(data.error || 'Error al insertar el artículo');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="insert-article-page">
      <h2>Insertar Nuevo Artículo</h2>
      <form className="insert-article-form" onSubmit={handleSubmit}>
        <label>
          Título:
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Extracto:
          <input name="excerpt" value={form.excerpt} onChange={handleChange} required />
        </label>
        <label>
          Imagen:
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <img src={imagePreview} alt="Vista previa" style={{ width: '100%', marginTop: '0.5rem', borderRadius: '6px' }} />
          )}
        </label>
        <label>
          Categoría:
          <input name="category" value={form.category} onChange={handleChange} required />
        </label>
        <label>
          Fecha:
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
        </label>
        <label>
          Autor:
          <input name="author" value={form.author} onChange={handleChange} required />
        </label>
        <label>
          Contenido:
          <textarea name="content" value={form.content} onChange={handleChange} required rows={6} />
        </label>
        <button className="insert-article-btn" type="submit" disabled={loading}>
          {loading ? 'Insertando...' : 'Insertar Artículo'}
        </button>
      </form>
      {error && <div className="insert-article-error">{error}</div>}
      {success && <div className="insert-article-success">Artículo insertado correctamente.</div>}
      <button className="insert-article-back" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
}
