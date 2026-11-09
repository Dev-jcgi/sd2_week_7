// Actividades de la Semana 7 (SD2). Se juegan EN VIVO: las preguntas y sus respuestas viven solo en el
// servidor (Secret File preguntas.json en Render). Aquí queda únicamente lo que se muestra en la portada.
export const ACTIVIDADES = [
  { id: 'a1', n: 1, nombre: '¿Prueba o código primero?', momento: 'inicio', min: 8, color: '#FF8A3D', temas: 'Qué es TDD y el ciclo rojo → verde → refactor. Termómetro inicial.' },
  { id: 'a2', n: 2, nombre: 'Detective de commits', momento: 'antes del receso', min: 12, color: '#C6F33A', temas: 'Historiales con y sin TDD, el pipeline y el squash.' },
  { id: 'a3', n: 3, nombre: '¿Se mide o se excluye?', momento: 'después del receso', min: 5, color: '#6EA8FF', temas: 'Qué capas de user-module exigen el mínimo y qué dice un 70 %.' },
  { id: 'a4', n: 4, nombre: 'JaCoCo en acción', momento: 'antes de terminar', min: 5, color: '#B78CFF', temas: './mvnw verify, el mensaje de check y dónde se configura. Termómetro final.' },
];
export const ACTIVIDAD = Object.fromEntries(ACTIVIDADES.map((a) => [a.id, a]));
