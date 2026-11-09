import { useEffect, useRef, useState } from 'react';
import Deck from '../deck/Deck.jsx';
import { COLS } from '../deck/contenido.jsx';
import { TEMA } from '../data/temas.js';
import { crearSesion, lanzar, cerrar, retomar, terminar, reanudarRed, useSesion } from '../lib/sesion.js';
import Podio from './Podio.jsx';

/* Página del PROFESOR: crea la sesión, presenta y, al llegar a la diapositiva de una actividad, la lanza sola.
   La sesión se puede cerrar en cualquier momento y retomar después. */
const RED = { lista: 'Sesión lista', conectando: 'Preparando…', reconectando: 'Reconectando…', apagada: 'Sin sesión' };

export default function Profesor() {
  const s = useSesion();
  const [pos, setPos] = useState({ h: 0, v: 0 });
  const [podio, setPodio] = useState(false);
  const deck = useRef(null);

  useEffect(() => { reanudarRed(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.target.closest('input,textarea')) return; if (e.key === 'p' || e.key === 'P') setPodio((x) => !x); if (e.key === 'Escape') setPodio(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // Al llegar a la diapositiva de una actividad, se lanza sola en los celulares.
  useEffect(() => { const act = COLS[pos.h]?.act; if (act && s.abierta) lanzar(act); }, [pos.h, s.abierta]);

  if (!s.id) {
    return (
      <div className="page center-page">
        <div className="panel narrow">
          <p className="eyebrow">DS2 · Semana 7 · profesor</p>
          <h1 className="h-lg">Crear la sesión de la clase</h1>
          <p className="exp">Al crearla aparece un código QR que sirve para toda la clase. Cada actividad se lanza sola cuando llegues a su diapositiva. Puedes cerrar la sesión en cualquier momento y retomarla.</p>
          <button className="btn" onClick={crearSesion}>Crear sesión</button>
          <p className="note">Tu navegador es el centro de la sesión: no cierres esta pestaña durante la clase. Si la recargas, la sesión se retoma sola.</p>
          <p className="note"><a href="#/">← Volver al inicio</a></p>
        </div>
      </div>
    );
  }

  const col = COLS[pos.h];
  const n = Object.keys(s.alumnos).length;
  return (
    <div className="presenter">
      <div className="pin-badge">
        <span className={`estado mono ${s.red === 'lista' && s.abierta ? 'conectado' : s.abierta ? 'conectando' : 'desconectado'}`}><i />{s.abierta ? RED[s.red] || s.red : 'Sesión cerrada'}</span>
        <span className="mono">👥 {s.conectados} conectados · {n} en la sesión</span>
      </div>
      <div className="present-area">
        <div className="host-stage"><Deck ref={deck} start={{ h: 0, v: 0 }} onChange={setPos} active={!podio} /></div>
        {podio && <div className="host-game"><Podio alumnos={s.alumnos} /></div>}
      </div>
      <nav className="ctrl" aria-label="Controles del profesor">
        <span className="mono cnum">{col?.tema ? `Tema ${TEMA[col.tema].n} · ${TEMA[col.tema].corto}` : col?.titulo} · {pos.h + 1}.{pos.v + 1}{s.activa ? ` · activa: actividad ${s.activa.slice(1)}` : ''}</span>
        <span className="grow" />
        <button className="cbtn" onClick={() => setPodio(!podio)}>{podio ? 'Volver (Esc)' : 'Podio (P)'}</button>
        {s.abierta
          ? <button className="cbtn fin-btn" onClick={() => { if (confirm('¿Cerrar la sesión? Los estudiantes ya no podrán responder hasta que la retomes.')) cerrar(); }}>Cerrar sesión</button>
          : <button className="btn" onClick={retomar}>Retomar sesión</button>}
        {!s.abierta && <button className="cbtn" onClick={() => { if (confirm('¿Terminar y borrar la sesión? Se pierden los puntos y el QR deja de funcionar.')) { terminar(); location.hash = '#/'; } }}>Terminar y borrar</button>}
        <button className="cbtn" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} aria-label="Pantalla completa">⛶</button>
      </nav>
    </div>
  );
}
