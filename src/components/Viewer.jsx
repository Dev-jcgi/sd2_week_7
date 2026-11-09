import { useRef, useState } from 'react';
import Deck from '../deck/Deck.jsx';
import { COLS, TEMA_COL, ACT_COL } from '../deck/contenido.jsx';
import { TEMA } from '../data/temas.js';

/* Presentación 2D (reveal.js) para repasar sin conexión. La clase en vivo se dirige desde #/profesor.
   ?t=t3 abre un tema; ?a=a2 abre una actividad. */
export default function Viewer() {
  const deck = useRef(null);
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const [start] = useState(() => {
    const t = params.get('t'), a = params.get('a');
    return { h: t && TEMA_COL[t] != null ? TEMA_COL[t] : a && ACT_COL[a] != null ? ACT_COL[a] : 0, v: 0 };
  });
  const [pos, setPos] = useState(start);

  const col = COLS[pos.h];
  return (
    <div className="viewer">
      <div className="viewer-stage">
        <Deck ref={deck} start={start} onChange={setPos} />
      </div>
      <nav className="ctrl">
        <span className="mono cnum">{col?.tema ? `Tema ${TEMA[col.tema].n} · ${TEMA[col.tema].titulo}` : col?.titulo} · {pos.h + 1}.{pos.v + 1}</span>
        <span className="grow" />
        <a className="cbtn" href="#/profesor">Iniciar clase en vivo</a>
        <button className="cbtn" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} aria-label="Pantalla completa">⛶</button>
      </nav>
    </div>
  );
}
