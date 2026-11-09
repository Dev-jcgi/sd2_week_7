import { useState } from 'react';
import { ACTIVIDADES, EQUIPOS, CODIGO_CIERRE } from '../data/actividades.js';
import { store, celebrate } from '../lib/fx.js';
import Pregunta from './Pregunta.jsx';

/* La sesión del estudiante, sin servidor: un solo QR (#/vivo) para toda la clase.
   1. Escribe su nombre y elige su equipo (iniciar sesión).
   2. Cada actividad se desbloquea con el código que muestra su diapositiva.
   3. Responde y ve al momento si acertó; los puntos se suman en este celular.
   4. Con el código de cierre (última diapositiva) la sesión termina y queda el resumen para la captura. */
const KEY = 'sd2w7-sesion';
const NUEVA = { nombre: '', equipo: null, abiertas: [], res: {}, cerrada: null };

export default function Vivo() {
  const [s, setS] = useState(() => ({ ...NUEVA, ...(store.get(KEY) || {}) }));
  const guardar = (n) => { setS(n); store.set(KEY, n); };
  const [nombre, setNombre] = useState(s.nombre);
  const [act, setAct] = useState(null);
  const [i, setI] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');

  const puntosDe = (a) => a.preguntas.reduce((t, q) => t + (s.res[q.id]?.pts || 0), 0);
  const total = ACTIVIDADES.reduce((t, a) => t + puntosDe(a), 0);
  const eq = EQUIPOS.find((e) => e.id === s.equipo);

  /* ── 1. iniciar sesión ── */
  if (!s.nombre || !s.equipo) {
    return (
      <div className="page center-page">
        <form className="panel narrow" onSubmit={(e) => e.preventDefault()}>
          <p className="eyebrow">DS2 · Semana 7 · sesión de la clase</p>
          <h1 className="h-lg">Inicia tu sesión</h1>
          <p className="exp">Este es el único código QR de hoy. Deja esta página abierta: las cuatro actividades se desbloquean aquí durante la clase.</p>
          <div className="field"><label htmlFor="nom">Tu nombre</label><input id="nom" maxLength={30} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellido" autoFocus /></div>
          <p className="exp">Tu equipo</p>
          <div className="equipos">
            {EQUIPOS.map((e) => <button key={e.id} type="button" className="equipo" style={{ '--c': e.color }} disabled={!nombre.trim()}
              onClick={() => guardar({ ...NUEVA, nombre: nombre.trim(), equipo: e.id, inicio: Date.now() })}><b>{e.nombre}</b><span className="mono">{e.modulo}</span></button>)}
          </div>
        </form>
      </div>
    );
  }

  const cabecera = (
    <header className="sbar">
      <span className="chip mono" style={{ borderColor: eq.color }}>{eq.nombre}</span>
      <span className="who">{s.nombre}</span>
      <span className="chip mono">{total} pts</span>
    </header>
  );

  /* ── 4. sesión finalizada: resumen para la captura ── */
  if (s.cerrada) {
    return (
      <div className="page practica">
        {cabecera}
        <main className="sbody">
          <div className="qcard center-t">
            <p className="eyebrow">Sesión finalizada · {new Date(s.cerrada).toLocaleString('es')}</p>
            <p className="big ok">{total} pts</p>
            <h2>{s.nombre} · {eq.nombre}</h2>
            <div className="board">{ACTIVIDADES.map((a) => (
              <div key={a.id} className="lrow"><span className="r mono">A{a.n}</span><span className="nm">{a.nombre}</span>
                <span className="s mono">{s.abiertas.includes(a.id) ? `${puntosDe(a)} pts` : 'no abierta'}</span></div>
            ))}</div>
            <p className="exp">Dile a tu equipo tu total para el marcador. Para el Lab 7: lineamiento en la wiki, una tarea con TDD y la evidencia del Sprint 3, hasta el domingo 15/11.</p>
            <div className="row-btns" style={{ justifyContent: 'center' }}><a className="btn" href="#/ejercicio">Ejercicio TDD</a><a className="btn ghost" href="#/presentacion">Repasar la presentación</a></div>
          </div>
          <button className="btn ghost" onClick={() => { if (confirm('¿Borrar esta sesión de este celular?')) { guardar(NUEVA); setNombre(''); } }}>Borrar la sesión de este celular</button>
        </main>
      </div>
    );
  }

  /* ── 3. respondiendo una actividad ── */
  if (act) {
    const a = ACTIVIDADES.find((x) => x.id === act);
    const q = a.preguntas[i];
    const hecha = s.res[q.id];
    return (
      <div className="page practica">
        {cabecera}
        <main className="sbody">
          <p className="mono note">Actividad {a.n} · {a.nombre} · pregunta {i + 1} de {a.preguntas.length}</p>
          <Pregunta key={q.id} q={q} modo="practica" previo={q.compare ? s.res[q.compare]?.r : null}
            onResultado={(r, pts) => { if (pts === 100) celebrate(); guardar({ ...s, res: { ...s.res, [q.id]: { r, pts: pts || 0 } } }); }} />
          {hecha && (i + 1 < a.preguntas.length
            ? <button className="btn" onClick={() => setI(i + 1)}>Siguiente pregunta</button>
            : <button className="btn" onClick={() => { setAct(null); setI(0); }}>Terminar actividad · {puntosDe(a)} pts</button>)}
        </main>
      </div>
    );
  }

  /* ── 2. la sesión: actividades bloqueadas y desbloqueadas ── */
  const probar = (e) => {
    e.preventDefault();
    const c = codigo.trim().toUpperCase();
    setCodigo('');
    if (c === CODIGO_CIERRE) {
      if (confirm('¿Finalizar tu sesión? Ya no podrás responder más actividades.')) { guardar({ ...s, cerrada: Date.now() }); celebrate(true); }
      return;
    }
    const a = ACTIVIDADES.find((x) => x.codigo === c);
    if (!a) { setError('Ese código no corresponde a ninguna actividad. Míralo en la pantalla.'); return; }
    setError('');
    guardar({ ...s, abiertas: s.abiertas.includes(a.id) ? s.abiertas : [...s.abiertas, a.id] });
    setAct(a.id); setI(a.preguntas.findIndex((q) => !s.res[q.id]) === -1 ? 0 : a.preguntas.findIndex((q) => !s.res[q.id]));
  };

  return (
    <div className="page practica">
      {cabecera}
      <main className="sbody">
        <form className="qcard codigo-form" onSubmit={probar}>
          <p className="eyebrow">Código de la pantalla</p>
          <div className="codigo-row">
            <input aria-label="Código de la actividad" value={codigo} maxLength={4} onChange={(e) => setCodigo(e.target.value)} placeholder="ABCD" autoCapitalize="characters" />
            <button className="btn" disabled={codigo.trim().length < 4}>Abrir</button>
          </div>
          {error && <p className="note bad" role="alert">{error}</p>}
          <p className="note">Cada actividad se abre con el código que muestra su diapositiva. Al final de la clase, el código de cierre finaliza tu sesión.</p>
        </form>
        <div className="act-lista">
          {ACTIVIDADES.map((a) => {
            const abierta = s.abiertas.includes(a.id);
            const hechas = a.preguntas.filter((q) => s.res[q.id]).length;
            return (
              <button key={a.id} className={`act-item ${abierta ? '' : 'bloq'}`} style={{ '--c': a.color }} disabled={!abierta}
                onClick={() => { setAct(a.id); const k = a.preguntas.findIndex((q) => !s.res[q.id]); setI(k === -1 ? 0 : k); }}>
                <span className="mono">Actividad {a.n} · {a.momento}</span><b>{a.nombre}</b>
                <i className="mono">{!abierta ? '🔒 bloqueada' : hechas === a.preguntas.length ? `✓ ${puntosDe(a)} pts` : `${hechas}/${a.preguntas.length} respondidas`}</i>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
