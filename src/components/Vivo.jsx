import { useEffect, useState } from 'react';
import { ACTIVIDADES, ACTIVIDAD, EQUIPOS } from '../data/actividades.js';
import { store, celebrate } from '../lib/fx.js';
import { unirse, reportar, useAlumno } from '../lib/alumno.js';
import Pregunta from './Pregunta.jsx';

/* La página del ESTUDIANTE: un solo QR para toda la clase (#/vivo?s=<sesión>).
   Entra con su nombre y equipo; cuando el profesor llega a una actividad, aparece aquí sola.
   Si la conexión no funciona en esa red, puede abrir la actividad con el código de la pantalla. */
const KEY = 'sd2w7-mi-sesion';
const NUEVA = { sesion: null, nombre: '', equipo: null, res: {}, abiertasPorCodigo: [] };

export default function Vivo() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const [s, setS] = useState(() => {
    const g = { ...NUEVA, ...(store.get(KEY) || {}) };
    const q = params.get('s');
    return q && q !== g.sesion ? { ...NUEVA, sesion: q, nombre: g.nombre, equipo: g.equipo } : g;
  });
  const guardar = (n) => { setS(n); store.set(KEY, n); };
  const red = useAlumno();
  const [nombre, setNombre] = useState(s.nombre);
  const [i, setI] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [local, setLocal] = useState(null); // actividad abierta con código (sin conexión)

  useEffect(() => { store.set(KEY, s); if (s.sesion && s.nombre && s.equipo) unirse(s.sesion, s.nombre, s.equipo); }, [s.sesion, s.nombre, s.equipo]);

  const actVista = local || (red.red === 'conectada' && red.abierta ? red.activa : null);
  useEffect(() => {
    const x = actVista && ACTIVIDAD[actVista];
    if (x) { const k = x.preguntas.findIndex((q) => !s.res[q.id]); setI(k === -1 ? x.preguntas.length : k); }
  }, [actVista]);

  const puntosDe = (a) => a.preguntas.reduce((t, q) => t + (s.res[q.id]?.pts || 0), 0);
  const total = ACTIVIDADES.reduce((t, a) => t + puntosDe(a), 0);
  const eq = EQUIPOS.find((e) => e.id === s.equipo);

  if (!s.sesion) {
    return <div className="page center-page"><div className="panel narrow center-t"><p className="eyebrow">DS2 · Semana 7</p><h1 className="h-lg">Escanea el QR de la clase</h1><p className="exp">El profesor lo muestra al iniciar la sesión. Es el único código que necesitas hoy.</p></div></div>;
  }

  if (!s.nombre || !s.equipo) {
    return (
      <div className="page center-page">
        <form className="panel narrow" onSubmit={(e) => e.preventDefault()}>
          <p className="eyebrow">DS2 · Semana 7 · sesión de la clase</p>
          <h1 className="h-lg">Entra a la sesión</h1>
          <p className="exp">Deja esta página abierta: las actividades aparecen aquí solas cuando el profesor llegue a ellas.</p>
          <div className="field"><label htmlFor="nom">Tu nombre</label><input id="nom" maxLength={30} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellido" autoFocus /></div>
          <p className="exp">Tu equipo</p>
          <div className="equipos">
            {EQUIPOS.map((e) => <button key={e.id} type="button" className="equipo" style={{ '--c': e.color }} disabled={!nombre.trim()}
              onClick={() => guardar({ ...s, nombre: nombre.trim(), equipo: e.id })}><b>{e.nombre}</b><span className="mono">{e.modulo}</span></button>)}
          </div>
        </form>
      </div>
    );
  }

  const conectado = red.red === 'conectada';
  const cerrada = conectado && red.abierta === false;
  const actId = local || (conectado && red.abierta ? red.activa : null);
  const a = actId ? ACTIVIDAD[actId] : null;

  const responder = (q) => (r, pts) => {
    if (pts === 100) celebrate();
    guardar({ ...s, res: { ...s.res, [q.id]: { r, pts: pts || 0 } } });
    if (pts != null) reportar(q.id, pts || 0);
  };

  let cuerpo;
  if (cerrada && !local) {
    cuerpo = (
      <div className="qcard center-t">
        <p className="eyebrow">El profesor cerró la sesión</p>
        <p className="big ok">{total} pts</p>
        <h2>{s.nombre} · {eq.nombre}</h2>
        <div className="board">{ACTIVIDADES.map((x) => <div key={x.id} className="lrow"><span className="r mono">A{x.n}</span><span className="nm">{x.nombre}</span><span className="s mono">{puntosDe(x)} pts</span></div>)}</div>
        <p className="exp">Si el profesor la retoma, las actividades vuelven a aparecer aquí. Para el Lab 7: lineamiento en la wiki, una tarea con TDD y la evidencia del Sprint 3, hasta el domingo 15/11.</p>
        <div className="row-btns" style={{ justifyContent: 'center' }}><a className="btn" href="#/ejercicio">Ejercicio TDD</a><a className="btn ghost" href="#/presentacion">Repasar la presentación</a></div>
      </div>
    );
  } else if (a) {
    // Muestra la pregunta "i" de la actividad; si ya no quedan, la actividad está terminada.
    const actual = a.preguntas[i];
    if (!actual) {
      cuerpo = <div className="qcard center-t"><p className="eyebrow">Actividad {a.n} terminada</p><p className="big ok">{puntosDe(a)} pts</p><h2>{a.nombre}</h2><p className="exp">Espera: la siguiente actividad aparecerá aquí cuando el profesor llegue a ella.</p>
        {local && <button className="btn ghost" onClick={() => setLocal(null)}>Volver</button>}</div>;
    } else {
      const sig = a.preguntas.findIndex((q, j) => j > i && !s.res[q.id]);
      cuerpo = (
        <>
          <p className="mono note">Actividad {a.n} · {a.nombre} · pregunta {i + 1} de {a.preguntas.length}</p>
          <Pregunta key={actual.id} q={actual} modo="practica" previo={actual.compare ? s.res[actual.compare]?.r : null} onResultado={responder(actual)} />
          {s.res[actual.id] && <button className="btn" onClick={() => setI(sig === -1 ? a.preguntas.length : sig)}>{sig === -1 ? 'Terminar actividad' : 'Siguiente pregunta'}</button>}
        </>
      );
    }
  } else {
    cuerpo = <div className="qcard center-t"><p className="eyebrow">{conectado ? 'Dentro de la sesión' : 'Conectando con la sesión…'}</p><h2>Mira la pantalla del salón</h2><p className="exp">Cuando el profesor llegue a una actividad, aparecerá aquí sola.</p></div>;
  }

  const probar = (e) => {
    e.preventDefault();
    const c = codigo.trim().toUpperCase(); setCodigo('');
    const x = ACTIVIDADES.find((y) => y.codigo === c);
    if (!x) { setError('Ese código no corresponde a ninguna actividad.'); return; }
    setError(''); setLocal(x.id);
  };

  return (
    <div className="page practica">
      <header className="sbar">
        <span className={`estado mono ${cerrada ? 'desconectado' : conectado ? 'conectado' : 'conectando'}`}><i />{conectado ? (cerrada ? 'Sesión cerrada' : 'En la sesión') : 'Conectando…'}</span>
        <span className="who">{s.nombre}</span>
        <span className="chip mono" style={{ borderColor: eq.color }}>{eq.nombre}</span>
        <span className="chip mono">{total} pts</span>
      </header>
      <main className="sbody">
        {cuerpo}
        {!conectado && (
          <details className="lab">
            <summary>¿No conecta? Abre la actividad con el código de la pantalla</summary>
            <form className="codigo-row" onSubmit={probar}>
              <input aria-label="Código de la actividad" value={codigo} maxLength={4} onChange={(e) => setCodigo(e.target.value)} placeholder="ABCD" autoCapitalize="characters" />
              <button className="btn" disabled={codigo.trim().length < 4}>Abrir</button>
            </form>
            {error && <p className="note bad" role="alert">{error}</p>}
          </details>
        )}
      </main>
    </div>
  );
}
