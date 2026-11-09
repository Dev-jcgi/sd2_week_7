import { useSyncExternalStore } from 'react';
import { Peer } from 'peerjs';
import { store } from './fx.js';

/* Lado del estudiante: se conecta directo al navegador del profesor (PeerJS) con el id de la sesión
   que trae el QR (#/vivo?s=<id>). Si se corta, reintenta solo cada 3 s. */
const KEY_ID = 'sd2w7-alumno-id';
export const alumnoId = (() => {
  let id = store.get(KEY_ID);
  if (!id) { id = Math.random().toString(36).slice(2, 12); store.set(KEY_ID, id); }
  return id;
})();

let estado = { red: 'apagada', abierta: null, activa: null, sesion: null };
let peer = null, conn = null, hola = null, reintento = null;
const subs = new Set();
const set = (p) => { estado = { ...estado, ...p }; subs.forEach((f) => f()); };

function programar() { clearTimeout(reintento); reintento = setTimeout(abrir, 3000); }

function abrir() {
  if (!estado.sesion) return;
  set({ red: estado.red === 'conectada' ? 'reconectando' : 'conectando' });
  if (!peer || peer.destroyed) {
    peer = new Peer();
    peer.on('error', () => { set({ red: 'sin conexión' }); programar(); });
    peer.on('disconnected', () => { try { peer.reconnect(); } catch { /* */ } });
  }
  const conectar = () => {
    conn = peer.connect(estado.sesion, { reliable: true });
    conn.on('open', () => { set({ red: 'conectada' }); conn.send(hola); });
    conn.on('data', (m) => { if (m?.tipo === 'estado') set({ abierta: m.abierta, activa: m.activa }); });
    conn.on('close', () => { set({ red: 'sin conexión' }); programar(); });
    conn.on('error', () => { set({ red: 'sin conexión' }); programar(); });
  };
  if (peer.open) conectar(); else peer.once('open', conectar);
}

export function unirse(sesion, nombre, equipo) {
  hola = { tipo: 'hola', alumno: alumnoId, nombre, equipo };
  if (estado.sesion === sesion && conn?.open) { conn.send(hola); return; }
  set({ sesion });
  try { conn?.close(); } catch { /* */ }
  abrir();
}
export function reportar(q, pts) { if (conn?.open) conn.send({ tipo: 'respuesta', alumno: alumnoId, q, pts }); }
export function salir() { clearTimeout(reintento); try { conn?.close(); peer?.destroy(); } catch { /* */ } conn = null; peer = null; set({ red: 'apagada', sesion: null }); }

export function useAlumno() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => estado);
}
