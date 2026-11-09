import { Code } from '../deck/piezas.jsx';

const BASE = import.meta.env.BASE_URL;
const REPO = 'https://github.com/Dev-jcgi/sd2_week_7/tree/main/ejercicio-tdd';
const PASOS = [
  ['Prepara', '5 min', 'Copia ejercicio-tdd/inicio a una carpeta tuya, haz git init y un primer commit. Corre mvn test: la regla 1 ya está en rojo.', null],
  ['Regla 1 · verde', '10 min', 'Escribe en ChangeUserStatusUseCase el código mínimo para desactivar a un usuario. mvn test en verde → commit del código.', 'git add src/main && git commit -m "FEAT-57: Deactivate a user"'],
  ['Reglas 2 y 3', '15 min', 'Por cada TODO: escribe la prueba, mírala fallar y haz commit SOLO de la prueba. Después el código mínimo y su commit.', 'git add src/test && git commit -m "FEAT-57: Add test for activating a user"'],
  ['Regla 4 · el último ADMIN', '15 min', 'La prueba pide una excepción que no existe: el rojo es que no compila. Crea LastActiveAdminException y la condición.', 'git add src/test && git commit -m "FEAT-57: Add test for keeping one active admin"'],
  ['Regla 5 y refactor', '10 min', 'Con otro ADMIN activo sí se puede desactivar. Si el método creció, extrae la regla a un método privado (commit de refactor).', 'git commit -am "FEAT-57: Extract the last-admin rule"'],
  ['Mide con JaCoCo', '5 min', 'mvn verify y abre target/site/jacoco/index.html. El check exige 70 % en dominio y aplicación; la "pantalla" (infrastructure/ui) está excluida.', 'mvn verify'],
];

/** Guía del ejercicio TDD (inicio / solución) sobre la regla del último administrador activo de user-module. */
export default function Ejercicio() {
  return (
    <div className="page wrap doc-page">
      <p className="eyebrow">Tema 5 · Ejercicio de la semana</p>
      <h1 className="h-lg">TDD con la regla del último ADMIN</h1>
      <p className="lead">Un proyecto Maven en Java puro, copia reducida de <span className="mono">ChangeUserStatusUseCase</span> de user-module. En <b>inicio</b> la regla 1 está en rojo y las reglas 2 a 5 son TODO. En <b>solucion</b> hay 7 pruebas, 98 % de cobertura y el check de JaCoCo al 70 %.</p>
      <div className="cta">
        <a className="btn" href={REPO} target="_blank" rel="noreferrer">Código en GitHub ↗</a>
        <a className="btn ghost" href={`${BASE}diagramas/tdd-ciclo.html`} target="_blank" rel="noreferrer">El ciclo TDD ↗</a>
        <a className="btn ghost" href={`${BASE}diagramas/jacoco-maven.html`} target="_blank" rel="noreferrer">JaCoCo en Maven ↗</a>
      </div>
      <ol className="pasos">
        {PASOS.map(([t, m, d, cmd], i) => (
          <li key={t}><span className="mono">Paso {i + 1} · {m}</span><h3>{t}</h3><p>{d}</p>{cmd && <code className="mono cmd">{cmd}</code>}</li>
        ))}
      </ol>
      <Code titulo="Al terminar: git log --oneline (el orden es la evidencia)" lang="bash">{`
a7c3e10 FEAT-57: Extract the last-admin rule
96bd2f4 FEAT-57: Allow deactivating an admin when another is active
51e0a8b FEAT-57: Add test for deactivating an admin when another is active
c2f1d77 FEAT-57: Keep at least one active admin
0b9e4a2 FEAT-57: Add test for keeping one active admin
...
1d0c5e3 Start the exercise`}</Code>
      <p className="note">Entrega en tu página del Lab 7 (<span className="mono">Modulos/&lt;módulo&gt;/Laboratorio-semana-7/&lt;Nombre-Apellido&gt;</span>): captura de una prueba en rojo y en verde, la salida de <span className="mono">git log --oneline</span> y la captura del reporte de JaCoCo. En tu MR del capstone, el historial debe verse igual.</p>
    </div>
  );
}
