// Actividades de la Semana 7 (SD2). Se juegan en la sesión que crea el profesor (#/profesor): un solo QR
// (#/vivo?s=<sesión>) y cada actividad aparece sola en los celulares al llegar a su diapositiva.
// "codigo" es el respaldo para un celular que no logra conectarse: abre la actividad sin la sesión.
// Tipos: quiz · tf · classify (tarjetas a categorías) · order (ordenar) · scale (termómetro, sin respuesta correcta).
// En "order", "o" ya viene desordenado y "a" es el orden correcto (índices de "o").

const TERMO = ['Ciclo TDD', 'Commits de TDD en GitLab', 'Cobertura por capas', 'JaCoCo'];

export const ACTIVIDADES = [
  { id: 'a1', codigo: 'ROJO', n: 1, nombre: '¿Prueba o código primero?', momento: 'inicio', min: 8, color: '#FF8A3D', preguntas: [
    { id: 'a1q1', type: 'quiz', t: 25, q: '¿Qué significa TDD?',
      o: ['Test-Driven Development: desarrollo guiado por pruebas', 'Test Delivery Document: el documento de pruebas', 'Total Debug Day: un día para depurar', 'Team Design Decision: una decisión del equipo'],
      a: 0, e: 'Test-Driven Development (Kent Beck, 2002): primero se escribe una prueba que falla y después el código que la hace pasar.' },
    { id: 'a1q2', type: 'order', t: 30, q: 'Ordena los pasos del ciclo TDD', o: ['Verde: el código mínimo que hace pasar la prueba', 'Refactor: limpiar sin romper las pruebas', 'Rojo: una prueba que falla'],
      a: [2, 0, 1], e: 'Rojo → verde → refactor, y se repite con la siguiente regla. Cada vuelta es corta: minutos, no días.' },
    { id: 'a1q3', type: 'tf', t: 15, q: 'Hacer TDD es escribir todas las pruebas al final del sprint.', o: ['Verdadero', 'Falso'],
      a: 1, e: 'Falso. En TDD la prueba se escribe ANTES del código, una regla a la vez. Escribirlas al final es "test-last": útil, pero no es TDD.' },
    { id: 'a1q4', type: 'scale', t: 40, q: 'Termómetro: ¿qué tan seguro te sientes con cada tema de hoy?', o: TERMO, lo: 'nada', hi: 'podría explicarlo' },
  ] },
  { id: 'a2', codigo: 'GITS', n: 2, nombre: 'Detective de commits', momento: 'antes del receso', min: 12, color: '#C6F33A', preguntas: [
    { id: 'a2q1', type: 'classify', t: 60, q: '¿Este historial de una rama muestra TDD?', bins: ['Sí, es TDD', 'No se ve TDD'],
      o: ['1) Add test for empty order · 2) Reject an empty order', '1) Reject an empty order and add tests', '1) Add test… · 2) Implement… · 3) Refactor…', '1) Implement checkout · 2) Add tests for checkout', '1) WIP · 2) fix · 3) fix2'],
      a: [0, 1, 0, 1, 1], e: 'La evidencia es el orden: un commit que solo trae pruebas y, después, el commit con el código. Un commit con todo junto, o las pruebas al final, no lo demuestra.' },
    { id: 'a2q2', type: 'quiz', t: 30, q: 'Haces push SOLO del commit de pruebas (rojo). ¿Qué pasa en GitLab?',
      o: ['El pipeline queda en rojo: el commit tiene una prueba que falla', 'GitLab rechaza el push', 'El pipeline ignora las pruebas nuevas', 'Se fusiona solo'],
      a: 0, e: 'El pipeline corre el último commit del push. Por eso se hace push después del commit en verde: los dos commits suben juntos y el pipeline queda verde.' },
    { id: 'a2q3', type: 'quiz', t: 25, q: 'El SM fusiona el MR marcando "Squash commits". ¿Qué se pierde?',
      o: ['La evidencia de que la prueba se escribió primero', 'Las pruebas unitarias', 'El reporte de JaCoCo', 'Nada'],
      a: 0, e: 'Squash funde todos los commits en uno. En main ya no se ve el orden prueba → código. Por eso usamos rebase (merge semi-lineal) sin squash.' },
    { id: 'a2q4', type: 'tf', t: 15, q: 'Si la prueba nueva pasa sin escribir código, el ciclo TDD va bien.', o: ['Verdadero', 'Falso'],
      a: 1, e: 'Falso. Si pasa sin código nuevo, la prueba no está pidiendo nada nuevo (o está mal escrita). En TDD primero hay que verla fallar.' },
  ] },
  { id: 'a3', codigo: 'CAPA', n: 3, nombre: '¿Se mide o se excluye?', momento: 'después del receso', min: 5, color: '#6EA8FF', preguntas: [
    { id: 'a3q1', type: 'classify', t: 60, q: 'En el lineamiento de user-module, ¿qué pasa con cada clase?', bins: ['Mínimo 70 %', 'Se mide, sin mínimo', 'Se excluye'],
      o: ['User (domain/model)', 'ChangeUserStatusUseCase', 'EditUserController (JavaFX)', 'InMemoryUserRepositoryAdapter', 'UserModuleConfiguration (@Configuration)', 'Email (record con validación)'],
      a: [0, 0, 2, 1, 2, 0], e: 'Las reglas viven en dominio y aplicación: ahí se exige el mínimo. Los adaptadores de salida se prueban, pero no bloquean. Pantallas y configuración se prueban a mano en la app.' },
    { id: 'a3q2', type: 'quiz', t: 25, q: '¿Qué dice un 70 % de cobertura de líneas?',
      o: ['Que las pruebas ejecutaron 7 de cada 10 líneas', 'Que el 70 % del código no tiene errores', 'Que pasaron el 70 % de las pruebas', 'Que el 70 % de los requisitos está probado'],
      a: 0, e: 'La cobertura mide qué se EJECUTÓ durante las pruebas, no si está bien. Una línea ejecutada sin un assert que la verifique cuenta como cubierta.' },
  ] },
  { id: 'a4', codigo: 'AGEN', n: 4, nombre: 'JaCoCo en acción', momento: 'antes de terminar', min: 5, color: '#B78CFF', preguntas: [
    { id: 'a4q1', type: 'order', t: 35, q: 'Ordena lo que pasa en ./mvnw verify', o: ['report: genera index.html', 'Surefire corre las pruebas', 'check: compara con el mínimo', 'prepare-agent: engancha el agente'],
      a: [3, 1, 0, 2], e: 'prepare-agent prepara el agente → las pruebas corren y el agente cuenta líneas (jacoco.exec) → report arma el HTML → check hace fallar el build si no llega al mínimo.' },
    { id: 'a4q2', type: 'quiz', t: 30, q: '"Rule violated for package …usecase: lines covered ratio is 0.40, but expected minimum is 0.70". ¿Qué haces?',
      o: ['Escribo pruebas para las reglas de los casos de uso que faltan', 'Bajo el mínimo a 0.40', 'Excluyo el paquete usecase', 'Borro la regla check del pom'],
      a: 0, e: 'El mensaje dice qué paquete no llega. Bajar el mínimo o excluir lo que sí importa esconde el problema en vez de resolverlo.' },
    { id: 'a4q3', type: 'quiz', t: 20, q: '¿Dónde se configura JaCoCo en el capstone?',
      o: ['En el pom.xml de cada módulo, dentro de <build><plugins>', 'En .gitlab-ci.yml', 'En application.properties', 'En la wiki'],
      a: 0, e: 'Es un plugin de Maven. Como el pipeline ya corre ./mvnw install (que pasa por verify), el reporte y el check corren solos en GitLab.' },
    { id: 'a4q4', type: 'scale', t: 40, q: 'Termómetro final: ¿y ahora qué tan seguro te sientes?', o: TERMO, lo: 'nada', hi: 'podría explicarlo', compare: 'a1q4' },
  ] },
];
export const ACTIVIDAD = Object.fromEntries(ACTIVIDADES.map((a) => [a.id, a]));
export const LETRAS = ['A', 'B', 'C', 'D', 'E'];
export const EQUIPOS = [
  { id: 'A', nombre: 'Equipo A', modulo: 'delivery-module', color: '#FF8A3D' },
  { id: 'B', nombre: 'Equipo B', modulo: 'order-module', color: '#6EA8FF' },
  { id: 'C', nombre: 'Equipo C', modulo: 'catalog-module', color: '#C6F33A' },
  { id: 'D', nombre: 'Equipo D', modulo: 'payment-module', color: '#B78CFF' },
];
export const TIPO = { quiz: 'Quiz', tf: 'Verdadero o falso', classify: 'Clasifica', order: 'Ordena', scale: 'Termómetro' };

/** Puntaje 0..100 de una respuesta (null en el termómetro). */
export function puntaje(q, r) {
  if (q.type === 'scale') return null;
  if (r == null) return 0;
  if (q.type === 'classify') return Math.round((100 * q.a.reduce((s, b, i) => s + (r[i] === b ? 1 : 0), 0)) / q.a.length);
  if (q.type === 'order') return Array.isArray(r) && r.every((v, i) => v === q.a[i]) ? 100 : 0;
  return r === q.a ? 100 : 0;
}
