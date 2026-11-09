import { useState } from 'react';
import { ACTIVIDADES, ACTIVIDAD, EQUIPOS } from '../data/actividades.js';
import { store, celebrate } from '../lib/fx.js';
import Pregunta from './Pregunta.jsx';

/* Práctica individual: cada estudiante responde en su celular y ve al momento si acertó.
   Todo se guarda en su navegador (sin servidor). */
const KEY = 'sd2w6-practica';

export default function Practica() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const [estado, setEstado] = useState(() => store.get(KEY) || { equipo: null, res: {} });
  const guardar = (s) => { setEstado(s); store.set(KEY, s); };
  const [act, setAct] = useState(params.get('a') && ACTIVIDAD[params.get('a')] ? params.get('a') : null);
  const [i, setI] = useState(0);

  if (!estado.equipo) {
    return (
      <div className="page center-page">
        <div className="panel narrow">
          <p className="eyebrow">DS2 · Semana 6 · actividades</p>
          <h1 className="h-lg">¿De qué equipo eres?</h1>
          <p className="exp">Tus respuestas se quedan en este celular. Al final de cada actividad verás tu puntaje para aportarlo a tu equipo.</p>
          <div className="equipos">
            {EQUIPOS.map((e) => <button key={e.id} className="equipo" style={{ '--c': e.color }} onClick={() => guardar({ ...estado, equipo: e.id })}><b>{e.nombre}</b><span className="mono">{e.modulo}</span></button>)}
          </div>
        </div>
      </div>
    );
  }

  const eq = EQUIPOS.find((e) => e.id === estado.equipo);
  const total = (a) => a.preguntas.reduce((s, q) => s + (estado.res[q.id]?.pts || 0), 0);

  if (!act) {
    return (
      <div className="page practica">
        <header className="sbar"><span className="chip mono" style={{ borderColor: eq.color }}>{eq.nombre}</span><span className="who">Actividades de la semana 6</span>
          <button className="chip" onClick={() => guardar({ ...estado, equipo: null })}>cambiar equipo</button></header>
        <main className="sbody">
          <div className="act-lista">
            {ACTIVIDADES.map((a) => {
              const hechas = a.preguntas.filter((q) => estado.res[q.id]).length;
              return (
                <button key={a.id} className="act-item" style={{ '--c': a.color }} onClick={() => { setAct(a.id); setI(0); }}>
                  <span className="mono">Actividad {a.n} · {a.momento}</span><b>{a.nombre}</b>
                  <span className="mono">{hechas}/{a.preguntas.length} respondidas{hechas ? ` · ${total(a)} pts` : ''}</span>
                </button>
              );
            })}
          </div>
          <p className="note center-t">También puedes repasar en el <a href="#/">mapa C4</a> y la <a href="#/presentacion">presentación</a>.</p>
        </main>
      </div>
    );
  }

  const a = ACTIVIDAD[act];
  const q = a.preguntas[i];
  const fin = i >= a.preguntas.length;
  const previo = q?.compare ? estado.res[q.compare]?.r : null;

  return (
    <div className="page practica">
      <header className="sbar">
        <button className="chip" onClick={() => setAct(null)}>← actividades</button>
        <span className="who">A{a.n} · {a.nombre}</span>
        <span className="chip mono" style={{ borderColor: eq.color }}>{eq.id} · {total(a)} pts</span>
      </header>
      <main className="sbody">
        <div className="progreso-q">{a.preguntas.map((p, k) => <i key={p.id} className={k < i ? 'hecha' : k === i ? 'actual' : ''} />)}</div>
        {!fin ? (
          <div className="qcard">
            <Pregunta key={q.id} q={q} previo={previo} onResultado={(r, pts) => {
              guardar({ ...estado, res: { ...estado.res, [q.id]: { r, pts: pts || 0 } } });
              if (pts === 100) celebrate();
            }} />
            {estado.res[q.id] && <button className="btn sig" onClick={() => setI(i + 1)}>{i === a.preguntas.length - 1 ? 'Ver resultado' : 'Siguiente →'}</button>}
          </div>
        ) : (
          <div className="qcard center-t">
            <p className="eyebrow">Actividad {a.n} terminada</p>
            <p className="big ok">{total(a)} pts</p>
            <p className="exp">Dile a tu equipo ({eq.nombre}) tu puntaje: el profesor suma el mejor del equipo en el marcador de la pantalla.</p>
            <div className="row-btns" style={{ justifyContent: 'center' }}>
              <button className="btn ghost" onClick={() => setI(0)}>Repetir</button>
              <button className="btn" onClick={() => setAct(null)}>Otras actividades</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
