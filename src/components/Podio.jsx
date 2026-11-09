import { EQUIPOS } from '../data/actividades.js';
import { tabla } from '../lib/sesion.js';

/** Podio de la sesión: por nombre (con los puntos que reportó cada celular) y total por equipo. */
export default function Podio({ alumnos }) {
  const { lista, equipos } = tabla(alumnos);
  const slots = [[1, 'var(--tileB)', 170], [0, 'var(--tileC)', 230], [2, 'var(--tileA)', 130]];
  return (
    <div className="qcard">
      <h2 className="center-t">Podio de la sesión</h2>
      <div className="podium">{slots.map(([k, bg, h]) => <div key={k} className="pod" style={{ background: bg, height: h }}>{lista[k] ? <><span className="p mono">{k + 1}</span><span>{lista[k].nombre}</span><span className="mono">{lista[k].puntos}</span></> : <span className="mono">—</span>}</div>)}</div>
      <div className="board">{lista.slice(3, 10).map((x, i) => <div key={x.nombre + i} className="lrow"><span className="r mono">#{i + 4}</span><span className="nm">{x.nombre}</span><span className="s mono">{x.puntos}</span></div>)}</div>
      <div className="eq-tot">{EQUIPOS.map((e) => <div key={e.id} style={{ borderColor: e.color }}><span className="mono">{e.nombre}</span><b className="mono" style={{ color: e.color }}>{equipos[e.id]}</b></div>)}</div>
    </div>
  );
}
