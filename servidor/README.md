# Servidor de la clase en vivo (DS2 · Semana 7)

Java 21 + [Java-WebSocket](https://github.com/TooTallNate/Java-WebSocket), sin Spring. Cada celular abre **una** conexión (QR → `#/vivo`) y por ella recibe todas las preguntas de la clase. El profesor entra con su clave en `#/profesor`, lanza y revela las preguntas, muestra el podio y **finaliza la sesión**.

| Clase | Qué hace |
|---|---|
| `ClaseServer` | `onOpen`, `onMessage`, `onClose`; revisa el `Origin`, la clave del profesor y el límite de mensajes |
| `Juego` | Preguntas y puntos. Califica los 5 formatos: `quiz`, `tf`, `classify`, `order` y `scale` (termómetro, sin puntos) |
| `Preguntas` | Carga `preguntas.json` (Secret File en Render) o `preguntas.ejemplo.json` |

## Mensajes

| De → a | `tipo` | Campos |
|---|---|---|
| celular → servidor | `hola` | `rol` (`estudiante`/`profesor`), `nombre` o `clave` |
| celular → servidor | `respuesta` | `id`, `valor` (número en quiz/tf; lista en classify, order y scale) |
| profesor → servidor | `lanzar` · `revelar` · `ranking` · `reiniciar` · `finalizar` | `id` en `lanzar` |
| servidor → todos | `pregunta` | `formato`, `texto`, `opciones`, `bins`, `segundos` (**sin** la respuesta) |
| servidor → todos | `resultado` | `correcta`, `votos`/`aciertos`/`bien`/`promedios`, `explicacion` |
| servidor → cada estudiante | `puntos` · `fin` | total, nota de la última pregunta · resultado final y cierre 1000 |

## Formato de `preguntas.json`

```json
[{ "id": "a1q1", "actividad": 1, "formato": "quiz", "segundos": 25, "texto": "…", "opciones": ["…", "…"], "correcta": 0, "explicacion": "…" },
 { "id": "a2q1", "actividad": 2, "formato": "classify", "segundos": 60, "texto": "…", "opciones": ["…"], "bins": ["Sí", "No"], "correcta": [0, 1], "explicacion": "…" },
 { "id": "a1q2", "actividad": 1, "formato": "order", "segundos": 30, "texto": "…", "opciones": ["B", "C", "A"], "correcta": [2, 0, 1], "explicacion": "…" },
 { "id": "a1q4", "actividad": 1, "formato": "scale", "segundos": 40, "texto": "…", "opciones": ["TDD", "JaCoCo"], "lo": "nada", "hi": "podría explicarlo" }]
```

Puntos: hasta 500 por acertar y hasta 500 por rapidez, en proporción a lo acertado (clasificar la mitad bien da la mitad). Ordenar solo suma si el orden completo es correcto.

## Correr en local

```bash
mvn test                                   # 14 pruebas de integración
mvn package && PROFESOR_CLAVE=prueba java -jar target/sd2-vivo.jar
# en el sitio: http://localhost:5173/#/profesor?ws=ws://localhost:8080
```
