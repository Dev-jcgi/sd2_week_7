import { useEffect, useState } from 'react';
import { conectar, desconectar, enviar, useClase, useConexion, CODIGOS } from '../lib/conexion.js';
import { store, celebrate } from '../lib/fx.js';
import { Entrada, Resultado } from './Formatos.jsx';
import Mensajes, { EstadoConexion } from './Mensajes.jsx';

/* Página del ESTUDIANTE: un solo QR para toda la clase.
   El celular abre UNA conexión WebSocket con el servidor de la clase y por ella le llegan todas las preguntas. */
const EMOJIS = ['👍', '🔥', '🤯', '❓', '🚀'];
const CLAVE_NOMBRE = 'sd2s7-nombre';

export default function Vivo() {
  const [nombre, setNombre] = useState(() => store.get(CLAVE_NOMBRE) || '');
  const [dentro, setDentro] = useState(false);
  const [c, setC] = useClase();
  const con = useConexion();
  const [verMsgs, setVerMsgs] = useState(false);

  const entrar = (e) => {
    e?.preventDefault();
    const n = nombre.trim().slice(0, 20);
    if (!n) return;
    store.set(CLAVE_NOMBRE, n);
    setDentro(true);
    conectar({ tipo: 'hola', rol: 'estudiante', nombre: n });
  };
  useEffect(() => { if (store.get(CLAVE_NOMBRE)) entrar(); return () => desconectar(); }, []);
  useEffect(() => { if (c.resultado && c.nota === 1) celebrate(); }, [c.resultado, c.nota]);

  if (!dentro) {
    return (
      <div className="page center-page">
        <form className="panel narrow" onSubmit={entrar}>
          <p className="eyebrow">Clase en vivo · DS2 Semana 7</p>
          <h1 className="h-lg">Conéctate a la clase</h1>
          <p className="exp">Te conectas una sola vez: todas las actividades de hoy te llegan aquí, sin volver a escanear.</p>
          <div className="field"><label htmlFor="nom">Tu nombre o apodo</label><input id="nom" maxLength={20} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="p. ej. Ana_TDD" autoFocus /></div>
          <button className="btn" disabled={!nombre.trim()}>Conectarme</button>
        </form>
      </div>
    );
  }

  const p = c.pregunta, r = c.resultado;
  const rechazado = con.fase === 'desconectado' && con.cierre?.codigo === 1008;
  let cuerpo;
  if (c.fin) {
    const top = c.fin.top || [];
    cuerpo = (
      <div className="qcard center-t">
        <p className="eyebrow">La clase terminó · ¡gracias!</p>
        <p className="big ok">{c.fin.puntos ?? c.puntos} pts</p>
        <h2>{c.fin.lugar ? `Quedaste en el lugar ${c.fin.lugar}` : 'Gracias por participar'}</h2>
        <div className="board">{top.slice(0, 5).map((x, i) => <div key={x.nombre} className="lrow"><span className="r mono">#{i + 1}</span><span className="nm">{x.nombre}</span><span className="s mono">{x.puntos}</span></div>)}</div>
        <p className="exp">Para el Lab 7: lineamiento en la wiki, una tarea con TDD y la evidencia del Sprint 3, hasta el domingo 15/11.</p>
        <div className="row-btns" style={{ justifyContent: 'center' }}><a className="btn" href="#/ejercicio">Ver el ejercicio TDD</a><a className="btn ghost" href="#/presentacion">Repasar la presentación</a></div>
      </div>
    );
  } else if (rechazado) {
    cuerpo = <div className="qcard center-t"><p className="big bad">1008</p><h2>El servidor cerró tu conexión</h2><p className="exp">{con.cierre.razon || CODIGOS[1008]}.</p><button className="btn" onClick={entrar}>Volver a conectarme</button></div>;
  } else if (p && r && r.id === p.id) {
    const nota = c.nota;
    const titulo = r.formato === 'scale' ? 'Gracias' : nota == null ? 'Sin respuesta' : nota === 1 ? '¡Correcto!' : nota > 0 ? `Casi: ${Math.round(nota * 100)} %` : 'Esta vez no';
    cuerpo = (
      <>
        <p className={`big center-t ${r.formato === 'scale' || nota === 1 ? 'ok' : nota > 0 ? 'meh' : 'bad'}`}>{titulo}</p>
        <Resultado p={p} r={r} previo={r.id === 'a4q4' ? c.termometros.a1q4 : null} />
        <p className="note mono center-t">Tu total: {c.puntos} pts</p>
      </>
    );
  } else if (p) {
    cuerpo = <Entrada key={p.id} p={p} enviada={c.miRespuesta != null}
      onEnviar={(valor) => { if (enviar({ tipo: 'respuesta', id: p.id, valor })) setC((s) => ({ ...s, miRespuesta: valor })); }} />;
  } else {
    cuerpo = <div className="qcard center-t"><p className="eyebrow">Conectado y esperando</p><h2>Mira la pantalla del salón</h2><p className="exp">Cuando el profesor lance una pregunta, te llegará aquí al instante, sin recargar.</p></div>;
  }

  return (
    <div className="page student vivo">
      <header className="sbar">
        <EstadoConexion />
        <span className="who">{c.yo?.nombre || nombre}</span>
        <span className="chip mono">{c.puntos} pts</span>
        <span className="chip mono">👥 {c.conectados}</span>
        {!c.fin && <button className="chip" onClick={() => { desconectar(); store.set(CLAVE_NOMBRE, null); setDentro(false); }}>cambiar nombre</button>}
      </header>
      <main className="sbody">
        {c.error && <p className="note bad" role="alert">Servidor: {c.error}</p>}
        {cuerpo}
        {!c.fin && <>
          <div className="reacciones">
            {EMOJIS.map((e) => <button key={e} onClick={() => enviar({ tipo: 'reaccion', emoji: e })} aria-label={`Reaccionar ${e}`}>{e}</button>)}
          </div>
          <div className="row-btns">
            <button className="btn ghost" onClick={() => setVerMsgs(!verMsgs)}>{verMsgs ? 'Ocultar mensajes' : 'Ver mensajes de la conexión'}</button>
          </div>
          {verMsgs && <Mensajes />}
        </>}
      </main>
    </div>
  );
}
