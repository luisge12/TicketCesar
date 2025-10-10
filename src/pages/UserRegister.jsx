// This file is a part of TicketCesar
// Created by Luis González

import { Navigate, useLocation } from 'react-router-dom';
import './../styles/user-register.css';
import { useState, useEffect } from 'react';

export default function UserRegister() {
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [lastname, setLastname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

  const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        const userData = {
            email: email,
            name: name,
            lastname: lastname,
            password: password,
            birthdate: birthdate,
            phone: phone,
        };
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData),
            });
            if (response.ok) {
                alert('usuario creado con exito');
                window.location.href = '/'
            } else {
                const errorData = await response.json();
                console.error('register failed:', errorData);
                alert('Register failed: ' + errorData.error);
            }
        } catch (error) {
            console.error('Error during register:', error);
            alert('An error occurred during register. Please try again.');
        }
        Navigate('/');
    }

    return (
        <div className="registro-container">
            <h2>Crear una cuenta</h2>
            <form className='user-register-form' onSubmit={handleSubmit}>
                <div className="user-register-form-group">
                    <label htmlFor="email" className="user-register-label">Email:</label>
                    <input
                        type="email"
                        name="email"
                        className='user-register-input'
                        autoComplete="email" // Añadido para el autocompletado del navegador
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="user-register-form-group">
                    <label htmlFor="name" className="user-register-label">Nombre:</label>
                    <input
                        type="text"
                        name="name"
                        className='user-register-input'
                        autoComplete="given-name"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="user-register-form-group">
                    <label htmlFor="lastname" className="user-register-label">Apellido:</label>
                    <input
                        type="text"
                        name="lastname"
                        className='user-register-input'
                        autoComplete="family-name"
                        onChange={(e) => setLastname(e.target.value)}
                    />
                </div>
                <div className="user-register-form-group">
                    <label htmlFor="password" className="user-register-label">Contraseña:</label>
                    <input
                        type="password"
                        name="password"
                        className='user-register-input'
                        autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="user-register-form-group">
                    <label htmlFor="confirmPassword" className="user-register-label">Confirmar Contraseña:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className='user-register-input'
                        autoComplete="new-password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="user-register-form-group">
                    <label htmlFor="birthdate" className="user-register-label">Fecha de Nacimiento:</label>
                    <input
                        type="date"
                        name="birthdate"
                        className='user-register-input'
                        autoComplete="bday"
                        onChange={(e) => setBirthdate(e.target.value)}
                    />
                </div>
                <div className="user-register-form-group">
                    <label htmlFor="phone" className="user-register-label">Número de Teléfono:</label>
                    <input
                        type="tel"
                        name="phone"
                        className='user-register-input'
                        autoComplete="tel"
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <button type="submit">Registrarme</button>
            </form>
        </div>
    );
};