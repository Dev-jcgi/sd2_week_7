# DS2 · Semana 7 · TDD y cobertura de código

**Desarrollo de Software 2 · Sección E · Capstone Delivery System**

Sesión de 2 horas con receso de 10 minutos. Todo es estático (GitHub Pages): no usa Firebase ni servidor.

| Parte | Ruta / carpeta | Qué es |
|---|---|---|
| Inicio | `#/` | Los 5 temas y los diagramas de la semana. |
| Presentación 2D | `#/presentacion` | reveal.js: una columna por tema (→) y detalle hacia abajo (↓). **P** abre el marcador de equipos, **ESC** la vista general. `?t=t3` abre un tema y `?a=a2` una actividad. |
| Actividades | `#/actividades` | Cada estudiante elige su equipo (A–D) y responde en su celular con autocorrección. En la presentación, las mismas preguntas se proyectan para que los equipos compitan; el profesor suma puntos en el marcador (se guarda en su navegador). |
| Ejercicio TDD | `#/ejercicio`, `ejercicio-tdd/` | La regla «siempre queda un ADMIN activo» de user-module con TDD: `inicio` (regla 1 en rojo, reglas 2–5 como TODO) y `solucion` (7 pruebas, 98 % de cobertura, check de JaCoCo al 70 %). Java 25 + JUnit + AssertJ + JaCoCo. |
| Diagramas | `archify/` → `public/diagramas/` | 6 diagramas hechos con [Archify](https://archify.si): ciclo TDD, TDD en GitLab, rebase vs. squash, cobertura por capa en user-module, JaCoCo en Maven y dónde va todo en el capstone. |

## Temas y agenda

| Min | Qué |
|---|---|
| 0–10 | Inicio + **Actividad 1 · ¿Prueba o código primero?** |
| 10–25 | Tema 1 · TDD: la prueba va primero |
| 25–45 | Tema 2 · TDD en GitLab y GitHub: un commit por paso |
| 45–60 | **Actividad 2 · Detective de commits** |
| 60–70 | Receso (diapositiva con cuenta regresiva) |
| 70–75 | **Actividad 3 · ¿Se mide o se excluye?** |
| 75–93 | Tema 3 · Cobertura de código en la arquitectura hexagonal |
| 93–105 | Tema 4 · JaCoCo: medir la cobertura con Maven |
| 105–113 | Tema 5 · En tu módulo: el lineamiento de user-module + ejercicio |
| 113–118 | **Actividad 4 · JaCoCo en acción** |
| 118–120 | Cierre y podio de equipos |

## Publicar en GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Cualquier push a `main` (o **Actions → Publicar en GitHub Pages → Run workflow**) publica el sitio en `https://<dominio>/sd2_week_7/`.

No hace falta configurar variables.

## Desarrollo local

```bash
npm install
npm run dev
```

## Ejercicio

```bash
cd ejercicio-tdd/inicio && mvn test      # empieza en rojo: es el paso 1 de TDD
cd ejercicio-tdd/solucion && mvn verify  # 7 pruebas, reporte en target/site/jacoco/index.html
```

## Regenerar los diagramas

```bash
git clone https://github.com/tt-a1i/archify
node archify/archify/bin/archify.mjs validate architecture archify/cobertura-hexagonal.architecture.json --quality showcase
node archify/archify/bin/archify.mjs render architecture archify/cobertura-hexagonal.architecture.json public/diagramas/cobertura-hexagonal.html --quality showcase
```

## Referencias

- Beck, K. (2002). *Test-Driven Development: By Example*. Addison-Wesley.
- Freeman, S. y Pryce, N. (2009). *Growing Object-Oriented Software, Guided by Tests*. Addison-Wesley.
- Fowler, M. (2012). *TestCoverage*. https://martinfowler.com/bliki/TestCoverage.html
- Meszaros, G. (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley.
- JaCoCo. *Maven Plug-in*. https://www.jacoco.org/jacoco/trunk/doc/maven.html
- GitLab Docs. *Squash and merge* y *Test coverage visualization*.
