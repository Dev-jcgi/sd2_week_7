# DS2 · Semana 7 · TDD y cobertura de código

**Desarrollo de Software 2 · Sección E · Capstone Delivery System**

Sesión de 2 horas con receso de 10 minutos. Todo es estático (GitHub Pages), sin servidor propio: el navegador del profesor es el centro de la sesión y los celulares se conectan directo a él con [PeerJS](https://peerjs.com) (WebRTC). **Un solo QR para toda la clase.**

| Parte | Ruta / carpeta | Qué es |
|---|---|---|
| Inicio | `#/` | Los 5 temas y los diagramas de la semana. |
| Presentación 2D | `#/presentacion` | reveal.js para repasar sin sesión: una columna por tema (→) y detalle hacia abajo (↓). Cada pregunta tiene su diapositiva con **Revelar respuesta**. **P** abre el marcador manual de equipos, **ESC** la vista general. |
| Profesor | `#/profesor` | **Crear sesión** → aparece el QR de la sesión. Al llegar a la diapositiva de una actividad, **se lanza sola** en los celulares. **Cerrar sesión** y **Retomar sesión** en cualquier momento; si recargas la página, la sesión se retoma con el mismo QR. **P** muestra el podio (por nombre y por equipo). |
| Mi sesión (estudiante) | `#/vivo?s=<sesión>` | Escanea el QR, escribe su nombre y elige su equipo. Cada actividad aparece sola cuando el profesor llega a ella; responde con autocorrección y su puntaje llega al podio. Si su red no permite la conexión, abre la actividad con el código de respaldo de la diapositiva. |
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

## En la clase

1. Abre `#/profesor` y pulsa **Crear sesión**. No cierres esa pestaña: tu navegador es la sesión.
2. En la diapositiva «Entra a la sesión», los estudiantes escanean el QR, escriben su nombre y eligen su equipo. Ves cuántos están conectados.
3. Presenta. Al llegar a la portada de cada actividad, esta aparece sola en los celulares; en la portada ves cuántos ya respondieron. Baja (↓) a cada pregunta y pulsa **Revelar respuesta** para comentarla.
4. **Cerrar sesión** cuando quieras (cada celular muestra el resumen de sus puntos) y **Retomar sesión** para continuar. **P** muestra el podio; la última diapositiva también.
5. **Terminar y borrar** (con la sesión cerrada) elimina la sesión y su QR.

> Si la red de la universidad bloquea las conexiones directas entre navegadores, el celular sigue en «Conectando…»: el estudiante abre la actividad con el código de respaldo de la portada (ROJO, GITS, CAPA, AGEN). Sus puntos no llegan al podio, pero puede responder igual.

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
