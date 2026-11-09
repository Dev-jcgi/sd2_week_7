import { EQUIPOS } from '../data/actividades.js';
import { sumar, reiniciar, useMarcador } from '../lib/marcador.js';
import { celebrate } from '../lib/fx.js';

/** Marcador de equipos para la pantalla del salón. compact = solo puntajes + botones +100. */
export default function Marcador({ compact = false, puntos = 100 }) {
  const m = useMarcador();
  const max = Math.max(1, ...Object.values(m));
  const lider = Object.entries(m).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className={`marcador ${compact ? 'compact' : ''}`}>
      {EQUIPOS.map((e) => (
        <div key={e.id} className={`meq ${lider[1] > 0 && lider[0] === e.id ? 'lider' : ''}`} style={{ '--c': e.color }}>
          <span className="mono nm">{e.nombre}</span>
          <div className="mbar"><i style={{ width: `${(m[e.id] / max) * 100}%` }} /></div>
          <b className="mono">{m[e.id]}</b>
          <div className="mbtns">
            <button onClick={() => { sumar(e.id, puntos); celebrate(); }} aria-label={`Sumar ${puntos} al ${e.nombre}`}>+{puntos}</button>
            {!compact && <button onClick={() => sumar(e.id, puntos / 2)} aria-label={`Sumar ${puntos / 2}`}>+{puntos / 2}</button>}
            <button onClick={() => sumar(e.id, -puntos / 2)} aria-label="Restar">−</button>
          </div>
        </div>
      ))}
      {!compact && <button className="cbtn mreset" onClick={() => confirm('¿Reiniciar el marcador de los cuatro equipos?') && reiniciar()}>Reiniciar marcador</button>}
    </div>
  );
}
