# DS2 · Semana 7 · TDD y cobertura de código

**Desarrollo de Software 2 · Sección E · Capstone Delivery System**

Sesión de 2 horas con receso de 10 minutos. El sitio está en GitHub Pages y las actividades se juegan **en vivo** con un servidor WebSocket en Render: un solo QR para toda la clase.

| Parte | Ruta / carpeta | Qué es |
|---|---|---|
| Inicio | `#/` | Los 5 temas y los diagramas de la semana. |
| Presentación 2D | `#/presentacion` | reveal.js para repasar sin conexión: una columna por tema (→) y detalle hacia abajo (↓). **ESC** la vista general. `?t=t3` abre un tema y `?a=a2` una actividad. |
| En vivo (estudiante) | `#/vivo` | Escanea el QR una vez, escribe su nombre y queda conectado: las 4 actividades le llegan solas. Al finalizar la sesión ve su puntaje y su lugar. |
| Profesor | `#/profesor` | **Iniciar sesión** con la clave → presentación + **Lanzar actividad N** → **Revelar respuesta** → **Siguiente pregunta** → **Mostrar podio** → **Finalizar sesión** → **Salir**. **C** abre el panel en vivo. |
| Servidor | [`servidor/`](servidor/README.md) → Render | Java + Java-WebSocket. Las preguntas y sus respuestas viven solo aquí (Secret File `preguntas.json`). 14 pruebas JUnit. |
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

## Puesta en marcha (una sola vez)

### 1. Servidor en Render (gratis)

1. En [render.com](https://render.com): **New → Blueprint** → elige este repositorio. Render lee `render.yaml` y crea el servicio `sd2-semana7-vivo` (Docker, plan gratis).
2. Te pedirá **PROFESOR_CLAVE**: la clave con la que entrarás a `#/profesor`. No se guarda en GitHub.
3. En el servicio → **Environment → Secret Files** → nombre `preguntas.json` → pega el archivo de preguntas reales (está en la carpeta privada del profesor). Sin él se usan las preguntas de ejemplo.
4. Si la URL no es `sd2-semana7-vivo.onrender.com`: en GitHub, **Settings → Secrets and variables → Actions → Variables** → `VITE_WS_URL` = `wss://<tu-servicio>.onrender.com` y vuelve a publicar.

> El plan gratis duerme el servidor tras 15 minutos sin tráfico y tarda cerca de 1 minuto en despertar. **Abre `#/profesor` unos minutos antes de la clase.**

### 2. Sitio en GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Cualquier push a `main` (o **Actions → Publicar en GitHub Pages → Run workflow**) publica el sitio en `https://<dominio>/sd2_week_7/`.

## En la clase

1. Profesor: `#/profesor` → clave → **Iniciar sesión**. Presenta con las flechas.
2. Estudiantes: escanean el QR de la diapositiva «Conéctate ya» (`#/vivo`) y escriben su nombre. **Un solo QR para toda la clase.**
3. En cada columna de actividad aparece **Lanzar actividad N** → **Revelar respuesta** → **Siguiente pregunta**.
4. En el cierre: **Mostrar podio** y **Finalizar sesión** (cada celular recibe su resultado y se desconecta). **Salir**.

## Desarrollo local

```bash
cd servidor && mvn package && PROFESOR_CLAVE=prueba java -jar target/sd2-vivo.jar   # servidor
npm install && npm run dev                                                          # sitio (otra terminal)
# abre http://localhost:5173/#/profesor?ws=ws://localhost:8080
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
