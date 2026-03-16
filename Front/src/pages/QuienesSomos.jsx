import React, { useEffect } from 'react';
import '../styles/index.css';
import '../styles/app.css';
import '../styles/quienes-somos.css';
import { useNavigate } from 'react-router-dom';

export default function QuienesSomos() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore in non-browser environments
    }
  }, []);
  return (
    <main className="quienes-page">
      {/* Navegación */}
      <nav className="blog-nav">
        <div>
          <button className={`blog-nav-btn ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Menú Inicial</button>
          <button className={`blog-nav-btn ${location.pathname.startsWith('/quienes-somos') ? 'active' : ''}`} onClick={() => navigate('/quienes-somos')}>Quienes Somos</button>
        </div>
      </nav>
     
      <h1>Quiénes somos</h1>
      <p>
        El Teatro César Rengifo es uno de los espacios culturales más emblemáticos de Mérida y de la Universidad de Los Andes. Su historia, que atraviesa siglos de transformaciones, habla de arquitectura, memoria, arte y compromiso con la cultura.
      </p>

      <section>
        <h2>Orígenes del espacio: de capilla a espacio cultural</h2>
        <p>
          El Teatro César Rengifo es mucho más que un escenario: es parte viva de la memoria arquitectónica, cultural y universitaria de Mérida. Su historia se remonta al siglo XVIII, cuando este espacio estuvo vinculado a la antigua Capilla del Seminario de San Buenaventura, una institución fundamental en los orígenes de la vida académica merideña. A finales del siglo XIX, aquella edificación colapsó tras años de deterioro y los efectos de un terremoto.
        </p>
        <p>
          De esas ruinas nació una nueva visión. En el contexto de las transformaciones institucionales de la Universidad de Los Andes, el lugar fue reconfigurado como espacio para actos públicos and vida cultural, integrándose al emblemático conjunto arquitectónico del Rectorado. Así comenzó una nueva etapa para un recinto que con los años se convertiría en referente de encuentro artístico, pensamiento universitario y patrimonio urbano de la ciudad.
        </p>
        <p>
          En 1981, el auditorio recibió el nombre de Teatro César Rengifo, en homenaje al reconocido dramaturgo, poeta y pintor venezolano César Rengifo, figura central de la cultura nacional. Desde entonces, el teatro consolidó aún más su identidad como espacio dedicado a las artes, la reflexión y la proyección cultural.
        </p>
      </section>

      <section>
        <h2>Un rescate necesario</h2>
        <p>
          En 2021, el teatro atravesaba uno de los momentos más difíciles de su historia reciente. El deterioro acumulado exigía una intervención urgente. En ese contexto comenzó un proceso de recuperación impulsado bajo la dirección de Igor Martínez, desde una lógica de autogestión, trabajo sostenido y compromiso con el patrimonio cultural del espacio. La recuperación no dependió de grandes estructuras externas, sino de la voluntad de activar nuevamente un lugar esencial para la vida cultural merideña.
        </p>
        <p>
          A esta labor se sumó un equipo multidisciplinario integrado por jóvenes vinculados a la Universidad de Los Andes, que aportaron desde distintas áreas al rescate físico y operativo del teatro. Ese esfuerzo permitió atender aspectos urgentes, reorganizar dinámicas internas y comenzar a devolverle vida a un recinto que había quedado rezagado por años.
        </p>
      </section>

      <section>
        <h2>La continuidad del esfuerzo</h2>
        <p>
          En 2022, Jony Parra Briceño dio continuidad a ese impulso, fortaleciendo la dinámica de trabajo y ayudando a consolidar el camino de recuperación y reactivación del teatro. Su vínculo con el espacio y con la actividad escénica ha quedado reflejado en distintas iniciativas públicas asociadas al Teatro César Rengifo.
        </p>
        <p>
          Más allá de las obras físicas, lo verdaderamente importante fue la reafirmación de una idea: que el teatro podía volver a ser un espacio vivo, útil y convocante, sostenido por la autogestión, la creatividad y el compromiso con la cultura.
        </p>
      </section>

      <section>
        <h2>Nuestro presente</h2>
        <p>
          El Teatro César Rengifo de hoy es el resultado de un esfuerzo colectivo que no solo recuperó un edificio, sino también su vocación como espacio de encuentro, creación y memoria. La labor desarrollada en los últimos años sentó bases firmes para su continuidad y proyección.
        </p>
        <p>
          Actualmente, bajo la dirección de Carlos Moreno Gil, el teatro continúa fortaleciendo su vínculo con la comunidad y ampliando su horizonte como espacio cultural universitario abierto a la ciudad. Su gestión se sostiene sobre lo construido y proyecta nuevas posibilidades para seguir haciendo del César un punto de referencia para Mérida y para el país.
        </p>
        <p>
          Hoy, el Teatro César Rengifo no solo resguarda una historia admirable: también representa una certeza poderosa de que, cuando hay visión, trabajo en equipo y amor por la cultura, el patrimonio puede volver a latir.
        </p>
        <p>
          El Teatro César Rengifo sigue escribiendo su historia con cada función, cada aplauso y cada encuentro que hace de la cultura una experiencia viva.
        </p>
      </section>

      <section>
        <h2>Propósito institucional del Teatro</h2>
        <h3>Nuestro propósito</h3>
        <p>
          Más que una sala de espectáculos, el Teatro César Rengifo es un espacio concebido para conectar a la Universidad de Los Andes con la ciudad, y a la ciudad con la experiencia viva de la cultura. Su propósito institucional parte de esa vocación de servicio, encuentro y proyección.
        </p>
        <p>
          Desde allí se articulan su objetivo, su misión y su visión: no solo como definiciones formales, sino como el marco que guía su presente y su futuro.
        </p>

        <div className="qsv-box">
          <div className="qsv-item">
            <h3>Objetivo</h3>
            <p>
              Consolidar al Teatro César Rengifo como un espacio de extensión cultural de la Universidad de Los Andes, capaz de articular y proyectar diversas manifestaciones artísticas hacia la comunidad universitaria, la ciudad de Mérida y sus visitantes. Al mismo tiempo, ofrecer una plataforma para producciones regionales, nacionales e internacionales interesadas en la creación, la formación, la difusión del arte, la cultura y el entretenimiento.
            </p>
          </div>

          <div className="qsv-item">
            <h3>Misión</h3>
            <p>
              Ser una dependencia universitaria dedicada a fortalecer las distintas manifestaciones artísticas dentro y fuera de la Universidad de Los Andes, con criterios de calidad, eficiencia y organización que favorezcan tanto el desarrollo de proyectos por parte de los artistas como la experiencia del público.
            </p>
            <p>
              El Teatro César Rengifo ofrece un espacio integral y técnicamente preparado para las artes escénicas, musicales y visuales, así como para actividades académicas como congresos, conferencias y encuentros formativos. Asimismo, pone a disposición de la comunidad universitaria y de las producciones regionales, nacionales e internacionales un teatro con servicios integrados de sonido, iluminación, logística y personal capacitado para el desarrollo óptimo de sus eventos.
            </p>
          </div>

          <div className="qsv-item">
            <h3>Visión</h3>
            <p>
              Ser una referencia nacional e internacional en difusión, producción, investigación, formación y creación artística, con impacto en el ámbito universitario, regional y nacional. El Teatro César Rengifo aspira a contribuir de manera sostenida al desarrollo artístico y cultural de Mérida, consolidándose como un espacio emblemático para sus habitantes, sus visitantes y las futuras generaciones.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
