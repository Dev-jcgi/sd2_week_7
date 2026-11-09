import { useEffect, useState } from 'react';
import Landing from './components/Landing.jsx';
import Viewer from './components/Viewer.jsx';
import Vivo from './components/Vivo.jsx';
import Ejercicio from './components/Ejercicio.jsx';

const route = () => (location.hash.split('?')[0] || '#/').replace(/^#/, '') || '/';
const NAV = [['/', 'Inicio'], ['/vivo', 'Mi sesión'], ['/presentacion', 'Presentación'], ['/ejercicio', 'Ejercicio TDD']];

export default function App() {
  const [r, setR] = useState(route());
  useEffect(() => {
    const on = () => setR(route());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const Page = { '/presentacion': Viewer, '/vivo': Vivo, '/actividades': Vivo, '/ejercicio': Ejercicio }[r] || Landing;
  return (
    <>
      <header className="topbar">
        <a className="logo" href="#/"><i aria-hidden="true" />DS2 · Semana 7</a>
        <nav>{NAV.map(([h, t]) => <a key={h} href={`#${h}`} aria-current={r === h ? 'page' : undefined}>{t}</a>)}</nav>
      </header>
      <Page key={r} />
    </>
  );
}
