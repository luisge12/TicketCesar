import React, { useEffect } from 'react';
import '../styles/index.css';
import '../styles/app.css';
import '../styles/quienes-somos.css';

export default function QuienesSomos() {
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore in non-browser environments
    }
  }, []);
  return (
    <main className="quienes-page" style={{ width: '90vw', padding: '2rem', margin: '3rem', minHeight: '100vh', backgroundColor: 'var(--beige)', color: 'var(--black)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Quienes somos</h1>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Nuestra Historia: De Capilla a Emblema Cultural</h2>
        <p>
          El Teatro César Rengifo es un símbolo de la evolución cultural y académica de Mérida. Su historia comenzó en 1790 como la Capilla del Seminario de San Buenaventura, que, tras sufrir deterioro y los efectos de un terremoto, colapsó en 1891.
        </p>
        <p>
          Bajo la visión del rector Caracciolo Parra y Olmedo, las ruinas de la capilla se transformaron en un Salón de Actos Públicos. La construcción, dirigida por el maestro Eulogio Iriarte, culminó el 24 de marzo de 1900, dando vida a un edificio majestuoso con una torre de cinco pisos que funcionaba como mirador y observatorio astronómico.
        </p>
        <p>
          En 1981, el auditorio recibió el nombre de César Rengifo, en honor al reconocido dramaturgo, poeta y pintor venezolano, consolidando su legado como pilar fundamental de las artes y la educación.
        </p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Renacimiento en el Siglo XXI: Un Compromiso con la Recuperación</h2>
        <h3>2021: Un Llamado a la Acción</h3>
        <p>
          En 2021, el teatro se encontraba en un estado de abandono crítico. Bajo la dirección de Igor Martínez, se inició un ambicioso proyecto de recuperación. Se encontró con:
        </p>
        <ul>
          <li>Filtraciones en el techo y estructuras dañadas.</li>
          <li>Butacas, camerinos y el piano patrimonial en ruinas.</li>
        </ul>

        <p>Las transformaciones clave fueron:</p>
        <ul>
          <li>Nuevo Modelo de Gestión: Se implementó un sistema de autogestión donde los recursos generados se reinvertían directamente en el teatro.</li>
          <li>Equipo Multidisciplinario: Se convocó a 12 estudiantes y egresados de la ULA para trabajar en la recuperación, formando un equipo en áreas como producción, marketing y arquitectura.</li>
          <li>Mejoras Inmediatas: Se restauraron camerinos, se limpiaron telones y se establecieron nuevos planes de programación y comunicación.</li>
        </ul>

        <h3>2022: Consolidando el Esfuerzo</h3>
        <p>
          Jony Parra continuó la labor en 2022, dando seguimiento al modelo de autogestión. Sus logros incluyeron:
        </p>
        <ul>
          <li>La impermeabilización de la parte alta y la segunda planta.</li>
          <li>El inicio de la restauración del lobby.</li>
          <li>La reapertura gradual del teatro, atrayendo de nuevo al público y a organizadores de eventos.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Nuestro Presente y Legado</h2>
        <p>
          El trabajo en equipo de Igor Martínez, Jony Parra y un grupo de jóvenes comprometidos sentó las bases sólidas para el teatro que hoy conocemos. Establecieron un modelo de gestión autosustentable que permitió rescatar, reactivar y asegurar el futuro de este patrimonio cultural.
        </p>
        <p>
          El actual director, Carlos Moreno, reconoce este esfuerzo fundacional, que le permitió heredar un teatro en buenas condiciones y enfocarse en nuevas ideas y en fortalecer su vínculo con la comunidad.
        </p>
        <p>
          El Teatro César Rengifo hoy es el resultado de la pasión, la autogestión y el compromiso inquebrantable con la cultura.
        </p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Objetivo · Misión · Visión</h2>
        <div className="qsv-box">
          <div className="qsv-item">
            <h3>OBJETIVO</h3>
            <p>
              Hacer del Teatro César Rengifo una dependencia en la que se consoliden las actividades de extensión cultural de la Universidad de Los Andes en sus diversas manifestaciones artísticas dirigidas a la comunidad universitaria, merideña y visitante en general. Asimismo, ofrecer un espacio a producciones regionales, nacionales e internacionales que se interesan por la creación, formación y fomento del arte, la cultura y el entretenimiento.
            </p>
          </div>

          <div className="qsv-item">
            <h3>MISIÓN</h3>
            <p>
              Ser una dependencia universitaria enfocada en consolidar las distintas manifestaciones artísticas dentro y fuera de la Universidad de Los Andes, con estándares de calidad, eficiencia y organización que permitan a los artistas desarrollar sus proyectos y, al público, disfrutar de ellos; todo en un espacio altamente capacitado para el desarrollo de las artes escénicas, musicales, visuales, cine y actividades académicas como congresos y conferencias. De igual manera, ofrecer a la comunidad universitaria y a las producciones regionales, nacionales e internacionales el único Teatro de la ciudad que les brinda, en un solo lugar, un completo servicio de sonido, iluminación, logística y personal capacitado para el pleno desarrollo de sus eventos.
            </p>
          </div>

          <div className="qsv-item">
            <h3>VISIÓN</h3>
            <p>
              Hacer del Teatro César Rengifo una referencia nacional e internacional de difusión y producción del quehacer cultural, cuya plataforma de transmisión, investigación, formación y creación artística, tanto en el contexto universitario, como en el regional y nacional, contribuyan al desarrollo artístico–cultural de la ciudad de Mérida y de sus visitantes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
