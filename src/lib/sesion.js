import { useSyncExternalStore } from 'react';
import { Peer } from 'peerjs';
import { ACTIVIDAD } from '../data/actividades.js';
import { store } from './fx.js';

/* Sesión de la clase, SIN servidor propio: el navegador del profesor es el centro de la sesión.
   Los celulares se conectan directo a él con PeerJS (WebRTC); el servicio gratuito de PeerJS solo
   presenta a los navegadores entre sí. Nada que instalar ni publicar.

   Profesor: crearSesion() → al llegar a una actividad, lanzar('a2') → cerrar() / retomar() en cualquier momento.
   Lo que llega de cada estudiante: su nombre, su equipo y los puntos de cada pregunta que responde. */
const KEY = 'sd2w7-sesion-profesor';
const VACIA = { id: null, abierta: false, activa: null, alumnos: {}, creada: null };

let estado = { ...VACIA, ...(store.get(KEY) || {}), red: 'apagada', conectados: 0 };
let peer = null;
let reintento = null;
const conexiones = new Map(); // peerId del celular → conexión
const subs = new Set();

function set(p) {
  estado = { ...estado, ...p };
  const { red, conectados, ...guardar } = estado;
  store.set(KEY, guardar);
  subs.forEach((f) => f());
}
const contar = () => set({ conectados: [...conexiones.values()].filter((c) => c.open).length });

/** Lo que cada celular necesita saber para mostrar su pantalla. */
function foto() {
  return { tipo: 'estado', abierta: estado.abierta, activa: estado.abierta ? estado.activa : null };
}
function aTodos(msg) { conexiones.forEach((c) => { if (c.open) c.send(msg); }); }

function encender() {
  if (!estado.id || peer) return;
  set({ red: 'conectando' });
  peer = new Peer(estado.id);
  peer.on('open', () => set({ red: 'lista' }));
  peer.on('connection', (c) => {
    c.on('open', () => { conexiones.set(c.peer, c); contar(); c.send(foto()); });
    c.on('data', (m) => recibir(c, m));
    c.on('close', () => { conexiones.delete(c.peer); contar(); });
  });
  peer.on('disconnected', () => { set({ red: 'reconectando' }); try { peer.reconnect(); } catch { /* */ } });
  peer.on('error', (e) => {
    // Al recargar la página, el id puede seguir "ocupado" unos segundos: se reintenta.
    if (e.type === 'unavailable-id' || e.type === 'network' || e.type === 'server-error') {
      set({ red: 'reconectando' });
      apagar(); clearTimeout(reintento); reintento = setTimeout(encender, 3000);
    }
  });
}
function apagar() { conexiones.clear(); try { peer?.destroy(); } catch { /* */ } peer = null; }

function recibir(c, m) {
  if (!m || typeof m !== 'object') return;
  if (m.tipo === 'hola') {
    const nombre = String(m.nombre || '').replace(/[<>]/g, '').trim().slice(0, 30);
    const equipo = ['A', 'B', 'C', 'D'].includes(m.equipo) ? m.equipo : null;
    if (!nombre || !equipo) return;
    const prev = estado.alumnos[m.alumno] || { res: {} };
    set({ alumnos: { ...estado.alumnos, [m.alumno]: { ...prev, nombre, equipo } } });
    c.send(foto());
  } else if (m.tipo === 'respuesta' && estado.abierta) {
    const a = estado.alumnos[m.alumno];
    if (!a || typeof m.q !== 'string' || a.res[m.q] != null) return; // cuenta la primera respuesta
    const pts = Math.max(0, Math.min(100, Number(m.pts) || 0));
    set({ alumnos: { ...estado.alumnos, [m.alumno]: { ...a, res: { ...a.res, [m.q]: pts } } } });
  }
}

export function crearSesion() {
  apagar();
  const id = 'sd2s7-' + Math.random().toString(36).slice(2, 8);
  set({ ...VACIA, id, abierta: true, creada: Date.now() });
  encender();
}
/** Al llegar a la diapositiva de una actividad, se lanza sola. */
export function lanzar(actId) {
  if (!estado.abierta || estado.activa === actId || !ACTIVIDAD[actId]) return;
  set({ activa: actId });
  aTodos(foto());
}
export function cerrar() { set({ abierta: false }); aTodos(foto()); }
export function retomar() { set({ abierta: true }); encender(); aTodos(foto()); }
export function terminar() { aTodos({ tipo: 'estado', abierta: false, activa: null }); apagar(); set({ ...VACIA, red: 'apagada', conectados: 0 }); }
/** Al abrir #/profesor con una sesión guardada, vuelve a escuchar con el mismo id (los celulares reconectan solos). */
export function reanudarRed() { if (estado.id) encender(); }

export function useSesion() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => estado);
}

/** Puntos por estudiante y por equipo, con lo que reportaron los celulares. */
export function tabla(alumnos) {
  const lista = Object.values(alumnos).map((a) => ({ nombre: a.nombre, equipo: a.equipo, puntos: Object.values(a.res).reduce((s, p) => s + p, 0) }))
    .sort((x, y) => y.puntos - x.puntos);
  const equipos = { A: 0, B: 0, C: 0, D: 0 };
  lista.forEach((a) => { equipos[a.equipo] += a.puntos; });
  return { lista, equipos };
}
export function respondieron(alumnos, actId) {
  const qs = ACTIVIDAD[actId]?.preguntas.map((q) => q.id) || [];
  return Object.values(alumnos).filter((a) => qs.some((q) => a.res[q] != null)).length;
}
