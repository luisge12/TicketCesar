// This file is a part of TicketCesar
// Created by Luis González
import './../styles/footer.css';
import { Navigate } from 'react-router-dom';

export default function Footer() {
    const navigate = Navigate;

    return (
        <footer className="foot-main">
            
            <div className="footerContainer">

                {/* Lista izquierda */}
                <div className="colum">
                    <button className="logo-foot" onClick={() => {navigate('/'); }} > 
                        <img src="src/assets/TCR_H.png" className="logo-h-foot" alt="Logo"/>
                    </button>
                    <p>
                        Texto de introduccion del teatro que va a llevar varias lineas de texto probablemente
                    </p>
                </div>

                {/* Lista centro */}
                <div className="colum">
                    <h2 className="titulo-con-linea">Menú</h2>
                    <ul className="leftMenu">
                        <li className="item-lista-derecha"><a /*onClick={() => navigate('/direccion')}*/ className="link-name">Nosotros</a></li>
                        <li className="item-lista-derecha"><a /*onClick={() => navigate('/direccion')}*/ className="link-name">Equipo</a></li>
                    </ul>
                </div>
                {/* Lista derecha */}
                <div className="colum">
                    <h2 className="titulo-con-linea">Información</h2>
                    <ul className="leftMenu">
                        <li className=""><a /*onClick={() => navigate('/direccion')}*/ className="link-name">Dirección</a></li>
                        <li className=""><a /*onClick={() => navigate('/direccion')}*/ className="link-name">Teléfono</a></li>
                        <li className=""><a /*onClick={() => navigate('/direccion')}*/ className="link-name">Correo</a></li>
                    </ul>
                </div>

                {/* Redes sociales a la derecha */}
                <ul className="social">
                    <li><a /*onClick={() => navigate('/direccion')}*/ className='social-links'><img src="./src/assets/facebook.png" alt="facebook" className="inline-block h-6 w-6 mr-2"/></a></li>
                    <li><a /*onClick={() => navigate('/direccion')}*/ className='social-links'><img src="./src/assets/ig.png" alt="ig" className="inline-block h-6 w-6 mr-2"/></a></li>
                </ul>
            </div>

            {/* Copyright centrado */}
            <div className="foot-text">
                <p className="m-3">© 2025 TicketCesar | All rights reserved.</p>

            </div>
        </footer>
        
    );
}
