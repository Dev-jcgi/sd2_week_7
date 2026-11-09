import { T, Portada, Arch, Code, Cards, Card, YCapstone, QR } from './piezas.jsx';
import { Receso, Agenda } from './extras.jsx';
import { ACTIVIDADES } from '../data/actividades.js';
import Pregunta from '../components/Pregunta.jsx';
import Marcador from '../components/Marcador.jsx';
import { useSesion, respondieron } from '../lib/sesion.js';
import Podio from '../components/Podio.jsx';

/* Presentación de la Semana 7 · Desarrollo de Software 2.
   Cada columna (→) es un tema o una actividad; sus diapositivas (↓) profundizan.
   Caso real: user-module del capstone Delivery System (Java 25, JUnit, AssertJ, JaCoCo). */

const REPO = 'https://github.com/Dev-jcgi/sd2_week_7/tree/main';
const Lista = ({ items, frag }) => <ul className="d-list">{items.map((x, i) => <li key={i} className={frag ? 'fragment' : ''}>{x}</li>)}</ul>;
const Tabla = ({ head, rows, small }) => (
  <table className={`d-tabla ${small ? 'sm' : ''}`}><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table>
);
const Dos = ({ children, r = '1fr 1fr' }) => <div className="d-dos" style={{ gridTemplateColumns: r }}>{children}</div>;
const Analogia = ({ titulo, children }) => <div className="d-analogia"><span className="mono">Analogía</span><h3>{titulo}</h3>{children}</div>;
const Cita = ({ children, fuente }) => <blockquote className="d-cita"><p>{children}</p><cite className="mono">{fuente}</cite></blockquote>;

/** Historial de commits de una rama: [hash, mensaje, tipo] con tipo test | code | ref | mix. */
const Commits = ({ titulo, items, frag }) => (
  <div className={`d-git ${frag ? 'fragment' : ''}`}>
    {titulo && <p className="mono d-git-tit">{titulo}</p>}
    {items.map(([h, m, k]) => (
      <div key={h} className={`d-git-row ${k}`}><i /><span className="mono">{h}</span><p>{m}</p>
        <b className="mono">{{ test: 'solo pruebas', code: 'código', ref: 'refactor', mix: 'todo junto' }[k]}</b></div>
    ))}
  </div>
);

/** Barra de cobertura por paquete: [nombre, %, estado] con estado exige | mide | excluye. */
const Cobertura = ({ rows }) => (
  <div className="d-cov">
    {rows.map(([n, p, k]) => (
      <div key={n} className={`d-cov-row ${k}`}>
        <span className="mono">{n}</span>
        <div className="d-cov-bar"><i style={{ width: `${p}%` }} /><em style={{ left: '70%' }} /></div>
        <b className="mono">{String(p).replace('.', ',')} %</b>
      </div>
    ))}
    <p className="d-cov-ley mono"><i className="exige" /> se exige 70 % · <i className="mide" /> se mide · <i className="excluye" /> se excluye · ┆ = mínimo</p>
  </div>
);

/** Código de respaldo: abre la actividad en un celular que no logra conectarse a la sesión. */
const Codigo = ({ c, color, texto }) => <div className="d-codigo" style={{ '--c': color }}><span className="mono">{texto}</span><b>{c}</b></div>;

/** QR de la sesión: con la sesión creada (#/profesor) lleva su id; sin sesión, a #/vivo. */
function SesionQR({ size }) {
  const s = useSesion();
  return <QR ruta={s.id ? `#/vivo?s=${s.id}` : '#/vivo'} size={size} />;
}
/** Estado en vivo de la sesión (solo con la sesión creada). */
function EnVivo({ act }) {
  const s = useSesion();
  if (!s.id) return null;
  if (!s.abierta) return <p className="d-vivo mono off"><i /> Sesión cerrada</p>;
  const n = Object.keys(s.alumnos).length;
  return <p className="d-vivo mono"><i /> {act ? `${respondieron(s.alumnos, act)} de ${n} ya respondieron` : `${s.conectados} celulares conectados · ${n} en la sesión`}</p>;
}
/** Podio: el de la sesión (por nombre y equipo) o, sin sesión, el marcador manual de equipos. */
function PodioFinal() {
  const s = useSesion();
  return s.id ? <Podio alumnos={s.alumnos} /> : <Marcador />;
}

/* ── Actividades: portada con su código + una diapositiva por pregunta (modo pantalla, el profesor revela) ── */
function actividad(a) {
  return {
    id: a.id, titulo: `Actividad ${a.n}`, kind: 'act', act: a.id,
    slides: [
      <div className="d-act" style={{ '--c': a.color }} key="i">
        <p className="d-eti"><span className="pill">ACTIVIDAD {a.n} DE 4</span> {a.momento} · {a.min} min</p>
        <h1>{a.nombre}</h1>
        <Dos r="1.3fr 1fr">
          <div className="d-act-modos">
            <div><span className="mono">En tu celular</span><p>La actividad ya apareció en tu página de la sesión. Respondes y ves al momento si acertaste.</p></div>
            <div><span className="mono">En la pantalla</span><p>Cada equipo discute y responde en voz alta. El equipo que acierta suma puntos en el marcador.</p></div>
            <div className="d-act-items">{a.preguntas.map((q, i) => <div key={q.id}><span className="mono">{i + 1}</span><p>{q.q}</p></div>)}</div>
          </div>
          <div className="d-act-qr"><SesionQR size={190} /><p className="mono">¿Recién llegas? Escanea y entra</p><EnVivo act={a.id} /><Codigo c={a.codigo} color={a.color} texto="Si no conecta: código" /></div>
        </Dos>
      </div>,
      ...a.preguntas.map((q) => (
        <div className="d-pant" key={q.id}>
          <Pregunta q={q} modo="pantalla" />
          <Marcador compact />
        </div>
      )),
    ],
  };
}
const ACT = Object.fromEntries(ACTIVIDADES.map((a) => [a.id, actividad(a)]));

export const COLS = [
  /* ───────────── INICIO ───────────── */
  { id: 'inicio', titulo: 'Inicio', slides: [
    <div className="d-hero" key="p">
      <p className="d-eti">Desarrollo de Software 2 · Sección E · Semana 7</p>
      <h1>Primero la <em>prueba</em></h1>
      <p className="d-preg">Hoy escribimos la prueba antes que el código, lo demostramos con commits y medimos qué cubren nuestras pruebas.</p>
      <div className="d-hero-tags mono"><span>TDD</span><span>Commits</span><span>Cobertura</span><span>JaCoCo</span><span>user-module</span></div>
      <p className="d-nav mono">→ avanzar · ↓ profundizar · P marcador · ESC vista general</p>
    </div>,
    <>
      <T eti="Agenda">Dos horas, una regla real del capstone</T>
      <Agenda />
      <p className="d-sub">Receso de 10 minutos a la mitad. Las actividades suman puntos por equipo: A, B, C y D.</p>
    </>,
    <>
      <T eti="Entra a la sesión">Un solo código QR para toda la clase</T>
      <Dos r="1fr 1fr">
        <div className="d-act-qr"><SesionQR size={300} /><p className="mono">un solo código para toda la clase</p><EnVivo /></div>
        <Cards cols={1}>
          <Card t="1 · Escanea y entra" c="#FF8A3D">Escribe tu nombre y elige tu equipo. No hay que instalar nada.</Card>
          <Card t="2 · No cierres la página" c="#6EA8FF">Cuando lleguemos a una actividad, aparece sola en tu celular.</Card>
          <Card t="3 · Al final, tu resumen" c="#C6F33A">Cuando el profesor cierra la sesión, ves tus puntos por actividad.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T eti="El hilo de hoy">Una regla real de user-module</T>
      <Dos r="1.2fr 1fr">
        <div className="d-def">
          <p>FEAT-57: <b>«Siempre debe quedar al menos un administrador activo»</b>.</p>
          <p className="fragment">Hoy la escribimos con TDD: primero la prueba que falla, después el código.</p>
          <p className="fragment">Al final, JaCoCo nos dirá cuánto del módulo cubren nuestras pruebas.</p>
        </div>
        <Code small titulo="ChangeUserStatusUseCase · la regla">{`
if (isActiveAdmin
        && userRepository.countActiveByRole(ADMIN) <= 1) {
    throw new LastActiveAdminException();
}`}</Code>
      </Dos>
    </>,
  ] },

  ACT.a1,

  /* ───────────── TEMA 1 · TDD ───────────── */
  { id: 't1', tema: 't1', titulo: 'TDD', slides: [
    <Portada key="p" tema="t1" pregunta="¿Cómo sabes que tu código funciona, si nunca lo viste fallar?" />,
    <>
      <T tema="t1" eti="El problema">Escribir las pruebas «al final» casi nunca pasa</T>
      <Cards cols={3}>
        <Card t="Se acaba el sprint" c="#FF6B8B">El código ya funciona en la demo. Las pruebas quedan para «después», y después no llega.</Card>
        <Card t="Pruebas que confirman" c="#FFD166" frag>Escritas al final, prueban lo que el código ya hace, no lo que debería hacer.</Card>
        <Card t="Miedo a cambiar" c="#6EA8FF" frag>Sin pruebas, cada cambio puede romper algo sin que nadie se entere.</Card>
      </Cards>
    </>,
    <>
      <T tema="t1" eti="Analogía">Primero la meta, después el camino</T>
      <Dos>
        <Analogia titulo="El examen antes de estudiar">
          <p>Si conoces las preguntas del examen antes de estudiar, estudias justo lo necesario y sabes cuándo terminaste.</p>
          <p className="fragment">En <b>TDD</b> la prueba es esa pregunta: dice qué debe hacer el código antes de escribirlo.</p>
        </Analogia>
        <Cards cols={1}>
          <Card t="La prueba = la pregunta" c="#FF8A3D" frag>«¿Se puede desactivar al único ADMIN?» → no.</Card>
          <Card t="El código = la respuesta" c="#C6F33A" frag>Solo lo necesario para responder bien esa pregunta.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t1" eti="Definición">¿Qué es TDD?</T>
      <Dos r="1.2fr 1fr">
        <div className="d-def">
          <Cita fuente="Kent Beck · Test-Driven Development: By Example (2002)">Escribe código nuevo solo cuando una prueba automática haya fallado. Elimina la duplicación.</Cita>
          <p><b>TDD</b> = <i>Test-Driven Development</i>, desarrollo guiado por pruebas. La prueba se escribe <b>antes</b> que el código y lo guía.</p>
        </div>
        <Cards cols={1}>
          <Card t="Prueba unitaria" c="#FF8A3D">Prueba automática de una pieza pequeña (un caso de uso, una regla), sin base de datos real ni pantalla.</Card>
          <Card t="Assert" c="#6EA8FF">La línea que comprueba el resultado: <span className="mono">assertThat(x).isTrue()</span>.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t1" eti="El ciclo">Rojo → verde → refactor</T>
      <Cards cols={3}>
        <Card t="🔴 Rojo" c="#FF6B8B">Escribes UNA prueba de algo que todavía no existe. La corres: <b>falla</b>. Así sabes que la prueba sí detecta el problema.</Card>
        <Card t="🟢 Verde" c="#C6F33A" frag>Escribes el código <b>mínimo</b> para que pase. Nada «por si acaso».</Card>
        <Card t="🔵 Refactor" c="#6EA8FF" frag>Limpias nombres o duplicación. Las pruebas te avisan si rompiste algo.</Card>
      </Cards>
      <p className="d-capstone fragment"><b>Idea clave:</b> cada vuelta dura minutos. Una regla, una prueba, un poco de código. Y se repite.</p>
    </>,
    <>
      <T tema="t1" eti="Diagrama">El ciclo, paso a paso y con sus commits</T>
      <Arch src="tdd-ciclo" h={610} nota="Cada color del ciclo termina en un commit separado (tema 2)" />
    </>,
    <>
      <T tema="t1" eti="Código · paso rojo">1 · La prueba, antes de que exista la regla</T>
      <Dos r="1.4fr 1fr">
        <Code small titulo="ChangeUserStatusUseCaseTest.java (user-module)">{`
@Test
void rejectsDeactivatingTheOnlyActiveAdmin() {
    // Arrange
    User admin = repository.save(user("admin@example.com", UserRole.ADMIN));

    // Act
    Throwable thrown = catchThrowable(() -> changeStatus.execute(
            new ChangeUserStatusCommand(admin.getId().value(), UserStatus.INACTIVE)));

    // Assert
    assertThat(thrown).isInstanceOf(LastActiveAdminException.class)
            .hasMessage("There must be at least one active administrator");
    assertThat(repository.findById(admin.getId()).orElseThrow().isActive()).isTrue();
}`}</Code>
        <Lista items={[
          <><b>Arrange</b>: prepara los datos (un solo ADMIN).</>,
          <><b>Act</b>: una sola acción, la que se prueba.</>,
          <><b>Assert</b>: qué debe pasar. Aquí: error y el ADMIN sigue activo.</>,
          <>Al correrla: <b>no compila</b>, porque <span className="mono">LastActiveAdminException</span> no existe. Eso también es rojo.</>,
        ]} frag />
      </Dos>
    </>,
    <>
      <T tema="t1" eti="Código · paso verde">2 · El código mínimo para que pase</T>
      <Dos r="1.3fr 1fr">
        <Code small titulo="ChangeUserStatusUseCase.java">{`
public void execute(ChangeUserStatusCommand command) {
    UserId id = new UserId(command.id());
    User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    if (command.status() == UserStatus.ACTIVE) {
        user.activate();
    } else {
        boolean isActiveAdmin = user.isActive()
                && user.getRole() == UserRole.ADMIN;
        if (isActiveAdmin
                && userRepository.countActiveByRole(UserRole.ADMIN) <= 1) {
            throw new LastActiveAdminException();
        }
        user.deactivate();
    }
    userRepository.save(user);
}`}</Code>
        <div className="d-def">
          <p>Se crea la excepción y se agrega el <b>if</b> que la prueba pide.</p>
          <p className="fragment">Se corre <span className="mono">./mvnw test</span>: <b>verde</b>.</p>
          <p className="fragment">3 · <b>Refactor</b>: en el repo, la regla se movió a <span className="mono">ActiveAdminRule</span> porque <span className="mono">UpdateUserUseCase</span> también la usa (DRY).</p>
        </div>
      </Dos>
    </>,
    <>
      <T tema="t1" eti="Comparación">TDD frente a «probar al final»</T>
      <Tabla head={['', 'Probar al final (test-last)', 'TDD (test-first)']} rows={[
        ['Cuándo se escribe la prueba', 'Cuando el código ya funciona', 'Antes de escribir el código'],
        ['Qué prueba', 'Lo que el código hace', 'Lo que el código debe hacer (criterio de aceptación)'],
        ['¿Viste fallar la prueba?', 'Casi nunca', 'Siempre: es el paso rojo'],
        ['Cobertura', 'La que dé tiempo', 'Alta, porque cada regla nace con su prueba'],
        ['Diseño', 'Clases difíciles de probar', 'Clases pequeñas, con dependencias por constructor'],
      ]} />
    </>,
    <YCapstone key="y" tema="t1" items={[
      ['…tu historia del Sprint 3 tiene cuatro criterios de aceptación?', 'Escribir una prueba por criterio, de una en una: rojo, verde y refactor.'],
      ['…la prueba nueva pasa sin escribir código?', 'Sospechar: esa prueba no pide nada nuevo o no verifica bien. Hay que verla fallar.'],
      ['…para probar el caso de uso necesitas MySQL?', 'Usar el adaptador en memoria: el caso de uso depende del puerto, no de la base.'],
    ]} tarea="elijan UNA tarea de su historia del Sprint 3 y háganla con el ciclo TDD (Actividad 2 del Lab 7)." />,
  ] },

  /* ───────────── TEMA 2 · COMMITS EN GITLAB Y GITHUB ───────────── */
  { id: 't2', tema: 't2', titulo: 'Commits', slides: [
    <Portada key="p" tema="t2" pregunta="Si yo no te vi programar, ¿cómo me demuestras que escribiste la prueba primero?" />,
    <>
      <T tema="t2" eti="Analogía">La bitácora de un laboratorio</T>
      <Dos>
        <Analogia titulo="Hipótesis antes del experimento">
          <p>En un laboratorio, la hipótesis se anota con fecha <b>antes</b> del experimento. Si se escribe después, nadie puede saber si se ajustó al resultado.</p>
          <p className="fragment">Los <b>commits</b> son esa bitácora: tienen orden y fecha. El commit de la prueba, antes del código, es la evidencia de TDD.</p>
        </Analogia>
        <Cards cols={1}>
          <Card t="Commit 1 = hipótesis" c="#FF8A3D" frag>«Desactivar al único ADMIN debe fallar». Solo pruebas.</Card>
          <Card t="Commit 2 = experimento" c="#C6F33A" frag>El código que hace pasar esa prueba.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Por qué separar">Un commit por paso: ¿para qué sirve?</T>
      <Cards cols={2}>
        <Card t="Evidencia" c="#FF8A3D">El historial muestra que la prueba existió antes que el código. Es lo que se evalúa en el Lab 7.</Card>
        <Card t="Revisión más fácil" c="#6EA8FF" frag>El revisor lee primero la prueba (qué se pide) y después el código (cómo se resolvió).</Card>
        <Card t="Se puede comprobar" c="#C6F33A" frag>Con <span className="mono">git checkout</span> del commit 1, la prueba falla. Con el commit 2, pasa.</Card>
        <Card t="Commits atómicos" c="#B78CFF" frag>Cada commit hace una sola cosa, con un mensaje que lo explica.</Card>
      </Cards>
    </>,
    <>
      <T tema="t2" eti="Antes y después">FEAT-57 tal como está y como se vería con TDD</T>
      <Dos>
        <Commits titulo="Así está en el repo (1 commit)" items={[
          ['a5a1d11', 'FEAT-57: Keep at least one active administrator when changing a role or status.', 'mix'],
        ]} />
        <Commits frag titulo="Así se ve con TDD (3 commits)" items={[
          ['1a2b3c4', 'FEAT-57: Add tests for keeping one active administrator', 'test'],
          ['5d6e7f8', 'FEAT-57: Keep at least one active administrator when changing a status', 'code'],
          ['9a0b1c2', 'FEAT-57: Extract ActiveAdminRule so UpdateUserUseCase can reuse it', 'ref'],
        ]} />
      </Dos>
      <p className="d-sub fragment">El commit real mezcla 96 líneas de pruebas y el código: funciona, pero no demuestra el orden. Los hashes de la derecha son de ejemplo.</p>
    </>,
    <>
      <T tema="t2" eti="Código · Git">Los comandos de cada paso</T>
      <Dos r="1.3fr 1fr">
        <Code small lang="bash" titulo="terminal">{`
# 🔴 1. Rojo: escribo la prueba, la veo fallar y guardo SOLO la prueba
./mvnw test                      # falla (o no compila)
git add src/test/
git commit -m "FEAT-57: Add tests for keeping one active administrator"

# 🟢 2. Verde: escribo el código mínimo
./mvnw test                      # pasa
git add src/main/
git commit -m "FEAT-57: Keep at least one active administrator"

# 🔵 3. Refactor (opcional)
git commit -am "FEAT-57: Extract ActiveAdminRule"

# Subo los commits juntos, cuando ya está en verde
git push -u origin FEAT-57/feature/last-active-admin`}</Code>
        <Lista items={[
          <><span className="mono">git add src/test/</span> deja fuera el código: el commit 1 solo trae pruebas.</>,
          <>📸 Captura la prueba en <b>rojo</b> y en <b>verde</b>: es la evidencia del Lab 7.</>,
          <>Push <b>después</b> del verde: así el pipeline no queda en rojo.</>,
        ]} frag />
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Diagrama">Del commit al merge en GitLab</T>
      <Arch src="tdd-gitlab" h={560} nota="El pipeline corre el último commit del push; el SM revisa el orden en la pestaña Commits" />
    </>,
    <>
      <T tema="t2" eti="El merge">Rebase sí, squash no</T>
      <Dos r="1.1fr 1fr">
        <Arch src="rebase-vs-squash" h={500} />
        <div className="d-def">
          <p><b>Squash</b> junta todos los commits del MR en uno. En <span className="mono">main</span> ya no se ve qué se escribió primero.</p>
          <p className="fragment"><b>Rebase</b> (lo que usamos: merge semi-lineal) pone tus commits encima de <span className="mono">main</span>, tal cual y en orden.</p>
          <p className="d-capstone fragment"><b>Regla del capstone:</b> al fusionar, no marquen «Squash commits».</p>
        </div>
      </Dos>
    </>,
    <>
      <T tema="t2" eti="GitLab y GitHub">Dónde se ve y dónde se configura</T>
      <Tabla small head={['', 'GitLab (capstone)', 'GitHub']} rows={[
        ['Ver el orden de los commits', 'MR → pestaña Commits', 'Pull request → pestaña Commits'],
        ['Ver la prueba en rojo', 'Pipelines del commit 1, si se subió solo', 'Actions → la ejecución de ese commit'],
        ['Fusionar sin squash', 'Desmarcar «Squash commits when merge request is accepted»', 'Botón «Rebase and merge» (no «Squash and merge»)'],
        ['Configurar el proyecto', 'Settings → Merge requests → Merge method y Squash', 'Settings → General → Pull Requests'],
        ['Mostrar la cobertura en el MR', 'artifacts:reports:coverage_report (formato jacoco)', 'Subir el reporte de JaCoCo como artifact o comentario'],
      ]} />
    </>,
    <YCapstone key="y" tema="t2" items={[
      ['…subes solo el commit de pruebas y el pipeline queda en rojo?', 'Es esperado. Sube el commit en verde y el pipeline vuelve a verde. Mejor: push después del verde.'],
      ['…ya hiciste todo en un solo commit?', 'Para la próxima regla, separa. No reescribas historia de main ni fuerces pushes ajenos.'],
      ['…el SM marca «Squash commits»?', 'Se pierde la evidencia de TDD en main. Pidan merge con rebase, sin squash.'],
    ]} tarea="en su MR del Sprint 3, la pestaña Commits debe mostrar «Add test…» antes del commit del código. Enlácenla en su página del Lab 7." />,
  ] },

  { ...ACT.a2, slides: [...ACT.a2.slides, <Receso key="r" />] },

  ACT.a3,

  /* ───────────── TEMA 3 · COBERTURA EN LA HEXAGONAL ───────────── */
  { id: 't3', tema: 't3', titulo: 'Cobertura', slides: [
    <Portada key="p" tema="t3" pregunta="Si tus pruebas pasan, ¿cuánto de tu código revisaron de verdad?" />,
    <>
      <T tema="t3" eti="Analogía">El mapa de calor de un guardia</T>
      <Dos>
        <Analogia titulo="Las rondas de seguridad">
          <p>Un guardia hace rondas por un edificio. Al final del turno, el mapa muestra los pasillos que recorrió y los que nunca visitó.</p>
          <p className="fragment">La <b>cobertura de código</b> es ese mapa: muestra qué líneas recorrieron tus pruebas y cuáles nunca se ejecutaron.</p>
        </Analogia>
        <Cards cols={1}>
          <Card t="Pasillo recorrido" c="#C6F33A" frag>Línea cubierta: alguna prueba la ejecutó.</Card>
          <Card t="Pasillo sin visitar" c="#FF6B8B" frag>Línea sin cubrir: si tiene un error, ninguna prueba lo va a ver.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t3" eti="Definición">¿Qué es la cobertura de código?</T>
      <Dos>
        <div className="d-def">
          <p><b>Cobertura</b> = qué porcentaje del código se <b>ejecutó</b> mientras corrían las pruebas.</p>
          <p className="fragment"><b>Líneas</b>: cuántas líneas se ejecutaron. Es la que usaremos.</p>
          <p className="fragment"><b>Ramas</b>: si cada <span className="mono">if</span> se probó por el lado verdadero y por el falso.</p>
        </div>
        <Cards cols={1}>
          <Card t="Para qué sirve" c="#6EA8FF" frag>Encuentra reglas que nadie probó. Por ejemplo, el <span className="mono">else</span> que nunca se ejecutó.</Card>
          <Card t="Lo que NO dice" c="#FFD166" frag>No dice si el código está bien. Una línea ejecutada sin un assert que la revise cuenta igual.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t3" eti="La trampa">100 % de cobertura no es la meta</T>
      <Dos r="1.2fr 1fr">
        <Code small titulo="cubre la línea… y no prueba nada">{`
@Test
void coversButChecksNothing() {
    User admin = repository.save(user("admin@example.com", ADMIN));
    try {
        changeStatus.execute(
            new ChangeUserStatusCommand(admin.getId().value(), INACTIVE));
    } catch (RuntimeException ignored) {
    }
    // sin assert: la cobertura sube y la regla no se verifica
}`}</Code>
        <div className="d-def">
          <p>La cobertura es un <b>mapa</b>, no una nota.</p>
          <p className="fragment">Sirve para encontrar lo que falta probar, no para «llegar al número».</p>
          <Cita fuente="Martin Fowler · TestCoverage (2012)">La cobertura es útil para encontrar partes del código sin probar. Es poco útil como medida de qué tan buenas son las pruebas.</Cita>
        </div>
      </Dos>
    </>,
    <>
      <T tema="t3" eti="Diagrama">¿Dónde se mide en la arquitectura hexagonal?</T>
      <Arch src="cobertura-hexagonal" h={560} nota="Recorre las 3 vistas: se exige · se mide · se excluye" />
    </>,
    <>
      <T tema="t3" eti="Por capa">Qué se exige, qué se mide y qué se excluye</T>
      <Tabla head={['Capa (hexagonal)', 'Qué hay', 'Regla', 'Por qué']} rows={[
        ['Dominio', 'User, Email, reglas del agregado', 'Mínimo 70 %', 'Aquí viven las reglas del negocio'],
        ['Aplicación', 'Casos de uso y puertos', 'Mínimo 70 %', 'Cada criterio de aceptación pasa por aquí'],
        ['Adaptadores de salida', 'Memoria, JPA', 'Se mide, sin mínimo', 'Se prueban con H2; más lentas'],
        ['Adaptadores de entrada (UI)', 'Controladores JavaFX', 'Se excluye', 'Se prueban a mano en delivery-system'],
        ['Configuración', '@Configuration, @Bean', 'Se excluye', 'Solo conecta piezas; no tiene reglas'],
      ]} />
    </>,
    <>
      <T tema="t3" eti="user-module, hoy">Así se ve medido en el capstone</T>
      <Dos r="1.3fr 1fr">
        <Cobertura rows={[
          ['domain.model', 97.8, 'exige'],
          ['application.usecase', 99.4, 'exige'],
          ['adapter.out (memoria, JPA)', 98.8, 'mide'],
          ['adapter.in (pantallas)', 13.5, 'excluye'],
        ]} />
        <div className="d-def">
          <p>Dominio + aplicación: <b>98,5 %</b>.</p>
          <p className="fragment">Todo el módulo: <b>58 %</b>. Lo bajan las pantallas.</p>
          <p className="fragment">Si el % se pidiera sobre todo el módulo, habría que escribir pruebas de pantallas solo para subir el número.</p>
        </div>
      </Dos>
    </>,
    <YCapstone key="y" tema="t3" items={[
      ['…su módulo tiene 22 % en total?', 'Mirar solo dominio y aplicación. Entregas tiene 40 % ahí: faltan pruebas de 3 o 4 casos de uso.'],
      ['…un compañero propone excluir los casos de uso para llegar al mínimo?', 'No: es justo lo que hay que medir. Se excluye solo lo que se prueba de otra forma (UI, config).'],
      ['…llegan al 70 % con pruebas sin asserts?', 'El revisor del MR lo rechaza: el lineamiento pide asserts que verifiquen el comportamiento.'],
    ]} tarea="en su lineamiento (Actividad 1), escriban qué capas se exigen, qué se excluye y por qué, con el % actual de su módulo." />,
  ] },

  /* ───────────── TEMA 4 · JACOCO ───────────── */
  { id: 't4', tema: 't4', titulo: 'JaCoCo', slides: [
    <Portada key="p" tema="t4" pregunta="¿Quién cuenta las líneas que ejecutan tus pruebas, sin que cambies tu código?" />,
    <>
      <T tema="t4" eti="Analogía">El contador de pasos</T>
      <Dos>
        <Analogia titulo="La pulsera que cuenta pasos">
          <p>No cambias tu forma de caminar: te pones la pulsera y, al final del día, te dice cuántos pasos diste y por dónde.</p>
          <p className="fragment"><b>JaCoCo</b> es esa pulsera: se engancha a la JVM mientras corren las pruebas y cuenta cada línea ejecutada.</p>
        </Analogia>
        <Cards cols={1}>
          <Card t="La pulsera = el agente" c="#FF6B8B" frag>Un <i>Java agent</i> que observa las clases mientras se cargan.</Card>
          <Card t="El resumen = el reporte" c="#C6F33A" frag>Una página HTML con el % por paquete y las líneas en verde o en rojo.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Definición">¿Qué es JaCoCo y por qué usarlo?</T>
      <Dos>
        <div className="d-def">
          <p><b>JaCoCo</b> (<i>Java Code Coverage</i>) es una librería libre que mide la cobertura de código Java.</p>
          <p className="fragment">Se usa como <b>plugin de Maven</b>: se agrega al <span className="mono">pom.xml</span> y no cambia el código ni las pruebas.</p>
        </div>
        <Tabla small head={['Por qué JaCoCo', 'En el capstone']} rows={[
          ['Es el estándar en Java', 'Lo usan Maven, Gradle, IntelliJ, GitLab y SonarQube'],
          ['Funciona con Java 25', 'Versión 0.8.14'],
          ['Corre dentro de ./mvnw', 'El pipeline ya hace install → pasa por verify'],
          ['Puede frenar el build', 'Con check, si baja del mínimo'],
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Diagrama">Cómo trabaja dentro de ./mvnw verify</T>
      <Arch src="jacoco-maven" h={610} nota="prepare-agent → pruebas → jacoco.exec → report → check" />
    </>,
    <>
      <T tema="t4" eti="Código · pom.xml">Cómo se vincula: el plugin en el pom.xml</T>
      <Dos r="1.25fr 1fr">
        <Code small lang="xml" titulo="user-module/pom.xml · dentro de <build><plugins>">{`
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.14</version>
  <executions>
    <execution>                <!-- 1. engancha el agente -->
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>                <!-- 2. genera el reporte -->
      <id>report</id>
      <phase>verify</phase>
      <goals><goal>report</goal></goals>
    </execution>
  </executions>
</plugin>`}</Code>
        <Lista items={[
          <><b>prepare-agent</b>: antes de las pruebas, agrega <span className="mono">-javaagent</span> a la JVM de Surefire.</>,
          <><b>report</b>: en la fase <span className="mono">verify</span>, lee <span className="mono">jacoco.exec</span> y escribe <span className="mono">target/site/jacoco/</span>.</>,
          <>Abran <span className="mono">index.html</span> en el navegador: % por paquete y líneas en verde o rojo.</>,
        ]} frag />
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Código · el mínimo">Excluir lo que no se mide y exigir el 70 %</T>
      <Dos r="1.25fr 1fr">
        <Code small lang="xml" titulo="ejercicio-tdd/solucion/pom.xml">{`
<configuration>
  <excludes>
    <exclude>**/infrastructure/ui/**</exclude>
  </excludes>
</configuration>
...
<execution>
  <id>check</id>
  <phase>verify</phase>
  <goals><goal>check</goal></goals>
  <configuration><rules><rule>
    <element>PACKAGE</element>
    <includes>
      <include>org.jala.edu.user.domain.*</include>
      <include>org.jala.edu.user.application.*</include>
    </includes>
    <limits><limit>
      <counter>LINE</counter>
      <value>COVEREDRATIO</value>
      <minimum>0.70</minimum>
    </limit></limits>
  </rule></rules></configuration>
</execution>`}</Code>
        <div className="d-def">
          <p><b>excludes</b>: las pantallas no entran al reporte.</p>
          <p className="fragment"><b>check</b>: cada paquete de dominio y aplicación debe tener al menos 70 % de líneas.</p>
          <p className="fragment">En el Sprint 3 basta con el reporte. El <b>check</b> se activa en el Sprint 4.</p>
        </div>
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Cuando no llega">Qué dice Maven si la cobertura baja</T>
      <Code lang="bash" titulo="./mvnw verify · sin las pruebas del caso de uso">{`
[WARNING] Rule violated for package org.jala.edu.user.application.usecase:
          lines covered ratio is 0.00, but expected minimum is 0.70
[WARNING] Rule violated for package org.jala.edu.user.domain.model:
          lines covered ratio is 0.66, but expected minimum is 0.70
[ERROR] Failed to execute goal org.jacoco:jacoco-maven-plugin:0.8.14:check
[INFO] BUILD FAILURE`}</Code>
      <p className="d-capstone fragment"><b>Idea clave:</b> el mensaje dice qué paquete no llega. La solución es escribir las pruebas que faltan, no bajar el mínimo.</p>
    </>,
    <YCapstone key="y" tema="t4" items={[
      ['…su módulo no tiene JaCoCo?', 'Copiar el bloque del plugin en su pom.xml y correr ./mvnw verify. Está en la guía del Lab 7.'],
      ['…el pipeline de GitLab no muestra el %?', 'El reporte se genera igual en el job. Pueden guardarlo como artifact o abrirlo en local.'],
      ['…activan check y el pipeline de otro equipo falla?', 'Cada módulo tiene su propio pom: el check de un equipo solo afecta a su módulo.'],
    ]} tarea="agreguen JaCoCo a su pom.xml y peguen una captura del reporte en su lineamiento (sección 5)." />,
  ] },

  /* ───────────── TEMA 5 · EL LINEAMIENTO DE USER-MODULE ───────────── */
  { id: 't5', tema: 't5', titulo: 'Lineamiento', slides: [
    <Portada key="p" tema="t5" pregunta="¿Cómo logran cuatro personas escribir pruebas que parezcan de una sola?" />,
    <>
      <T tema="t5" eti="Analogía">Las reglas de estilo de un periódico</T>
      <Dos>
        <Analogia titulo="El manual de estilo">
          <p>En un periódico escriben decenas de periodistas, pero todo se lee igual: hay un manual que dice cómo se escriben las fechas, los nombres y los títulos.</p>
          <p className="fragment">El <b>lineamiento de pruebas</b> es el manual de estilo de las pruebas de su módulo. Lo acuerda el equipo y se revisa en cada MR.</p>
        </Analogia>
        <Cards cols={1}>
          <Card t="Actividad 1 del Lab 7" c="#B78CFF" frag>Un lineamiento por equipo en <span className="mono">Modulos/&lt;módulo&gt;/Pruebas-unitarias</span>.</Card>
          <Card t="Ejemplo resuelto" c="#C6F33A" frag><span className="mono">Modulos/Usuarios/Pruebas-unitarias</span>, con código real.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t5" eti="Las 5 secciones">Lo que user-module ya decidió</T>
      <Tabla small head={['Sección', 'Regla de user-module', 'Ejemplo real']} rows={[
        ['1 · Nombres', '<Clase>Test; método = frase del comportamiento', 'rejectsDeactivatingTheOnlyActiveAdmin'],
        ['2 · Organización', 'Mismo paquete; // Arrange · // Act · // Assert; AssertJ', 'ChangeUserStatusUseCaseTest'],
        ['3 · Setup', 'new + constructor; datos en UserFixtures; Spring solo en JPA', 'user("ana@example.com")'],
        ['4 · Mocking', 'Fakes antes que mocks: repositorio en memoria y lambdas', '0 usos de Mockito'],
        ['5 · Cobertura', '70 % en dominio + aplicación; UI y config excluidas', '98,5 % hoy'],
      ]} />
    </>,
    <>
      <T tema="t5" eti="Código · mocking">Fake o mock: lo que decidió user-module</T>
      <Dos>
        <Code small titulo="fake: el adaptador en memoria real">{`
private final InMemoryUserRepositoryAdapter repository =
        new InMemoryUserRepositoryAdapter();
private final ChangeUserStatusUseCase changeStatus =
        new ChangeUserStatusUseCase(repository, history,
                signedInAs(SIGNED_IN_ADMIN), TransactionRunner.direct());

// Assert sobre el ESTADO guardado
assertThat(repository.findById(id).orElseThrow().isActive()).isFalse();`}</Code>
        <Cards cols={1}>
          <Card t="Fake (lo preferimos)" c="#C6F33A">Una implementación simple y real del puerto. La prueba revisa el resultado, no qué métodos se llamaron.</Card>
          <Card t="Mock (Mockito)" c="#FFD166" frag>Solo para algo lento o externo sin fake simple: correo, pago real, reloj.</Card>
          <Card t="Nunca se mockea" c="#FF6B8B" frag>El dominio (User, Email): es justo lo que se prueba.</Card>
        </Cards>
      </Dos>
    </>,
    <>
      <T tema="t5" eti="Diagrama">¿Dónde va esto en el capstone?</T>
      <Arch src="capstone-calidad" h={540} nota="Recorre las 3 vistas: TDD en la rama · el MR lo comprueba · el equipo lo acuerda" />
    </>,
    <>
      <T tema="t5" eti="Ejercicio de la semana">TDD con la regla del último ADMIN</T>
      <Dos r="1.2fr 1fr">
        <div>
          <Lista items={[
            <><span className="mono">ejercicio-tdd/inicio</span>: la regla 1 está en rojo y las reglas 2 a 5 están como TODO.</>,
            <><span className="mono">ejercicio-tdd/solucion</span>: 7 pruebas, 98 % de cobertura y el check del 70 %.</>,
            <>Java 25 + JUnit + AssertJ + JaCoCo: <span className="mono">mvn verify</span>.</>,
            <>Un commit por paso (rojo, verde), como en su MR.</>,
          ]} />
          <p className="d-sub">Entrega en su página del Lab 7: capturas en rojo y en verde, y el historial de commits.</p>
        </div>
        <div className="d-act-qr"><QR ruta="#/ejercicio" size={220} /><p className="mono"><a href={`${REPO}/ejercicio-tdd`} target="_blank" rel="noreferrer">github · ejercicio-tdd ↗</a></p></div>
      </Dos>
    </>,
    <YCapstone key="y" tema="t5" items={[
      ['…cada integrante nombra las pruebas a su manera?', 'Acordar la regla en el lineamiento y pedirla en la revisión del MR.'],
      ['…el equipo C quiere usar Mockito para todo?', 'Puede, si lo justifica en el lineamiento. user-module muestra la alternativa con fakes.'],
      ['…su módulo ya está en 97 %?', 'Pueden fijar un mínimo más alto. El 70 % es el piso del curso, no el techo.'],
    ]} tarea="lineamiento en la wiki (Actividad 1), una tarea con TDD (Actividad 2) y la evidencia del Sprint 3 (Actividad 3), hasta el domingo 15/11." />,
  ] },

  ACT.a4,

  /* ───────────── CIERRE ───────────── */
  { id: 'cierre', titulo: 'Cierre', slides: [
    <>
      <T eti="Cierre">Cinco ideas para llevarse</T>
      <div className="d-ocho cinco">
        {[
          ['01', 'TDD: la prueba va primero. Rojo, verde y refactor.', '#FF8A3D'],
          ['02', 'Un commit por paso: la prueba antes del código. Sin squash.', '#C6F33A'],
          ['03', 'La cobertura es un mapa, no una nota. Se exige donde viven las reglas.', '#6EA8FF'],
          ['04', 'JaCoCo mide desde el pom.xml: prepare-agent, report y check.', '#FF6B8B'],
          ['05', 'El lineamiento es el manual de estilo de las pruebas del equipo.', '#B78CFF'],
        ].map(([n, t, c]) => <div key={n} className="fragment" style={{ borderColor: c }}><span className="mono" style={{ color: c }}>{n}</span><p>{t}</p></div>)}
      </div>
    </>,
    <>
      <T eti="Lab 7 · hasta el domingo 15/11, 23:59">Entregables</T>
      <Dos>
        <Lista items={[
          <><b>Actividad 1 (equipo)</b>: lineamiento en <span className="mono">Modulos/&lt;módulo&gt;/Pruebas-unitarias</span>.</>,
          <><b>Actividad 2</b>: una tarea con TDD, capturas en rojo y en verde, y el enlace a los commits del MR.</>,
          <><b>Actividad 3</b>: evidencia del Sprint 3 en su página individual.</>,
          <>Ejercicio <span className="mono">ejercicio-tdd</span> como práctica.</>,
        ]} />
        <div>
          <p className="d-eti">Referencias</p>
          <ul className="d-refs">
            <li>Beck, K. (2002). Test-Driven Development: By Example. Addison-Wesley.</li>
            <li>Freeman, S. y Pryce, N. (2009). Growing Object-Oriented Software, Guided by Tests.</li>
            <li>Fowler, M. (2012). TestCoverage. martinfowler.com</li>
            <li>Meszaros, G. (2007). xUnit Test Patterns (fakes, stubs y mocks).</li>
            <li>JaCoCo · Maven plug-in. jacoco.org/jacoco/trunk/doc/maven.html</li>
            <li>GitLab Docs · Squash and merge; Test coverage visualization.</li>
          </ul>
        </div>
      </Dos>
    </>,
    <div className="d-final" key="f">
      <p className="d-eti">Fin de la clase</p>
      <h1>¡Gracias! Este es el <em>podio</em></h1>
      <PodioFinal />
    </div>,
  ] },
];

export const TEMA_COL = Object.fromEntries(COLS.map((c, i) => [c.tema, i]).filter(([k]) => k));
export const ACT_COL = Object.fromEntries(COLS.map((c, i) => [c.act, i]).filter(([k]) => k));
