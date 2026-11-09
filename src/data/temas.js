// Temas de la Semana 7 de Desarrollo de Software 2: pruebas unitarias, TDD y cobertura con el capstone.
export const TEMAS = [
  { id: 't1', n: 1, titulo: 'TDD: la prueba va primero', corto: 'TDD', color: '#FF8A3D', min: 15 },
  { id: 't2', n: 2, titulo: 'TDD en GitLab y GitHub: un commit por paso', corto: 'Commits', color: '#C6F33A', min: 20 },
  { id: 't3', n: 3, titulo: 'Cobertura de código en la arquitectura hexagonal', corto: 'Cobertura', color: '#6EA8FF', min: 18 },
  { id: 't4', n: 4, titulo: 'JaCoCo: medir la cobertura con Maven', corto: 'JaCoCo', color: '#FF6B8B', min: 12 },
  { id: 't5', n: 5, titulo: 'En tu módulo: el lineamiento de user-module', corto: 'Lineamiento', color: '#B78CFF', min: 8 },
];
export const TEMA = Object.fromEntries(TEMAS.map((t) => [t.id, t]));
