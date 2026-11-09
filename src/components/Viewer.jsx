import { useEffect, useRef, useState } from 'react';
import Deck from '../deck/Deck.jsx';
import { COLS, TEMA_COL, ACT_COL } from '../deck/contenido.jsx';
import { TEMA } from '../data/temas.js';
import Marcador from './Marcador.jsx';

/* Presentación 2D (reveal.js) + marcador de equipos (tecla P).
   ?t=t3 abre un tema; ?a=a2 abre una actividad. */
export default function Viewer() {
  const deck = useRef(null);
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const [start] = useState(() => {
    const t = params.get('t'), a = params.get('a');
    return { h: t && TEMA_COL[t] != null ? TEMA_COL[t] : a && ACT_COL[a] != null ? ACT_COL[a] : 0, v: 0 };
  });
  const [pos, setPos] = useState(start);
  const [marcador, setMarcador] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input,textarea')) return;
      if (e.key === 'p' || e.key === 'P') setMarcador((x) => !x);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const col = COLS[pos.h];
  return (
    <div className="viewer">
      <div className="viewer-stage">
        <Deck ref={deck} start={start} onChange={setPos} active={!marcador} />
        {marcador && <div className="viewer-marcador"><p className="eyebrow">Marcador de equipos · P para cerrar</p><Marcador /></div>}
      </div>
      <nav className="ctrl">
        <button className={`cbtn ${marcador ? 'on' : ''}`} onClick={() => setMarcador(!marcador)}>Marcador (P)</button>
        <span className="mono cnum">{col?.tema ? `Tema ${TEMA[col.tema].n} · ${TEMA[col.tema].titulo}` : col?.titulo} · {pos.h + 1}.{pos.v + 1}</span>
        <span className="grow" />
        <button className="cbtn" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} aria-label="Pantalla completa">⛶</button>
      </nav>
    </div>
  );
}
