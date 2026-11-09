import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TEMAS } from '../data/temas.js';

const BASE = import.meta.env.BASE_URL;
const DIAGRAMAS = [
  ['tdd-ciclo', 'El ciclo TDD y sus commits', 't1'], ['tdd-gitlab', 'TDD en GitLab: del commit al merge', 't2'], ['rebase-vs-squash', 'Rebase sí, squash no', 't2'],
  ['cobertura-hexagonal', 'Cobertura por capa en user-module', 't3'], ['jacoco-maven', 'JaCoCo dentro de ./mvnw verify', 't4'], ['capstone-calidad', '¿Dónde va esto en el capstone?', 't5'],
];
const COLOR = Object.fromEntries(TEMAS.map((t) => [t.id, t.color]));

export default function Landing() {
  const hero = useRef(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(hero.current.children, { y: 26, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', clearProps: 'all' });
  }, []);
  return (
    <div className="page landing6">
      <section className="wrap hero6" ref={hero}>
        <p className="eyebrow">Desarrollo de Software 2 · Sección E · Semana 7 · Capstone Delivery System</p>
        <h1 className="display">Primero la <em>prueba</em>.</h1>
        <p className="lead">TDD con una regla real de user-module, la prueba antes del código en los commits, la cobertura de código en la arquitectura hexagonal y cómo medirla con JaCoCo.</p>
        <div className="cta">
          <a className="btn" href="#/actividades">Actividades</a>
          <a className="btn ghost" href="#/presentacion">Ver la presentación</a>
          <a className="btn ghost" href="#/ejercicio">Ejercicio TDD</a>
        </div>
      </section>
      <section className="wrap temas7">
        <p className="eyebrow">Los 5 temas de hoy</p>
        <div className="dl-grid">
          {TEMAS.map((t) => (
            <a key={t.id} className="dl-card tema7" style={{ '--c': t.color }} href={`#/presentacion?t=${t.id}`}>
              <span className="mono">Tema {t.n} · {t.min} min</span><b>{t.titulo}</b><i className="mono">abrir en la presentación →</i>
            </a>
          ))}
        </div>
      </section>
      <section className="wrap diag-list">
        <p className="eyebrow">Diagramas interactivos · hechos con Archify</p>
        <div className="dl-grid">
          {DIAGRAMAS.map(([f, t, tema]) => (
            <a key={f} className="dl-card tema7" style={{ '--c': COLOR[tema] }} href={`${BASE}diagramas/${f}.html`} target="_blank" rel="noreferrer"><b>{t}</b><i className="mono">abrir ↗</i></a>
          ))}
        </div>
      </section>
    </div>
  );
}
