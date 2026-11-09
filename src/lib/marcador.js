import { useEffect, useState } from 'react';
import { store } from './fx.js';

// Marcador de equipos A–D, guardado en el navegador del profesor (sin servidor).
// Todas las instancias en la página se sincronizan con un evento.
const KEY = 'sd2w6-marcador';
const VACIO = { A: 0, B: 0, C: 0, D: 0 };
export const leer = () => ({ ...VACIO, ...(store.get(KEY) || {}) });
export function sumar(eq, pts) {
  const m = leer(); m[eq] = Math.max(0, (m[eq] || 0) + pts); store.set(KEY, m);
  window.dispatchEvent(new Event('marcador'));
}
export function reiniciar() { store.set(KEY, VACIO); window.dispatchEvent(new Event('marcador')); }
export function useMarcador() {
  const [m, setM] = useState(leer);
  useEffect(() => {
    const on = () => setM(leer());
    window.addEventListener('marcador', on); window.addEventListener('storage', on);
    return () => { window.removeEventListener('marcador', on); window.removeEventListener('storage', on); };
  }, []);
  return m;
}
