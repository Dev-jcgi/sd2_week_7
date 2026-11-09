# Ejercicio TDD · la regla del último ADMIN

Copia reducida de `ChangeUserStatusUseCase` de **user-module** (FEAT-57: «siempre debe quedar al menos un administrador activo»). Java 25, JUnit, AssertJ y JaCoCo. Sin Spring ni JavaFX, para enfocarse en el ciclo TDD.

| Carpeta | Estado |
|---|---|
| `inicio/` | La regla 1 está escrita y **en rojo** (`mvn test` falla). Las reglas 2–5 están como `TODO` en `ChangeUserStatusUseCaseTest`. |
| `solucion/` | 7 pruebas en verde, 98 % de cobertura de líneas. `mvn verify` corre el check de JaCoCo (70 % en dominio y aplicación; `infrastructure/ui` excluida). |

## Paso a paso (un commit por paso)

```bash
cp -r inicio ~/tdd-ultimo-admin && cd ~/tdd-ultimo-admin
git init && git add . && git commit -m "Start the exercise"
mvn test                                   # 🔴 la regla 1 falla
```

Por cada regla:

1. 🔴 Escribe la prueba (o usa la regla 1, que ya está). `mvn test` debe **fallar**. 📸 Captura.
   `git add src/test && git commit -m "FEAT-57: Add test for <regla>"`
2. 🟢 Escribe el código **mínimo** en `ChangeUserStatusUseCase`. `mvn test` en **verde**. 📸 Captura.
   `git add src/main && git commit -m "FEAT-57: <qué hace el código>"`
3. 🔵 Si hace falta, limpia el código sin romper las pruebas.
   `git commit -am "FEAT-57: Refactor <qué>"`

Reglas, en orden:

| # | Prueba | Qué debe pasar |
|---|---|---|
| 1 | `deactivatesAnActiveUser` | Un usuario activo pasa a INACTIVE (ya escrita) |
| 2 | `activatesAnInactiveUser` | Un usuario INACTIVE pasa a ACTIVE |
| 3 | `throwsWhenTheUserDoesNotExist` | `UserNotFoundException` con el id en el mensaje |
| 4 | `rejectsDeactivatingTheOnlyActiveAdmin` | `LastActiveAdminException` («There must be at least one active administrator») y el ADMIN sigue activo. La excepción todavía no existe: el rojo es que no compila |
| 5 | `deactivatesAnAdminWhenAnotherAdminIsActive` | Con otro ADMIN activo, sí se desactiva |

Al final:

```bash
mvn verify                                 # reporte en target/site/jacoco/index.html
git log --oneline                          # cada "Add test…" va antes de su código
```

## Qué entregar

En tu página del Lab 7 (`Modulos/<módulo>/Laboratorio-semana-7/<Nombre-Apellido>`): una captura en rojo y otra en verde, la salida de `git log --oneline` y la captura del reporte de JaCoCo. En tu MR del capstone, la pestaña **Commits** debe verse igual.
