# Self-healing E2E tests with Healenium

WebdriverIO + Cucumber (Gherkin) + TypeScript, wired to **Healenium** so a locator broken by a redesign repairs itself at runtime instead of breaking the build.

## English summary

**What this is.** An E2E suite against [ceizaketines.es](https://ceizaketines.es), a real website, written in Gherkin/TypeScript, plus a self-hosted Healenium stack (8 Docker containers) that heals broken locators. Two independent parts:

| Part | Depends on | Deterministic? |
|---|---|---|
| `features/site/` (12 scenarios) | A **live site** | No |
| `features/healing/` (healing demo) | Only Docker (local pages) | Yes |

**What I found along the way.**

- **Healenium's Playwright proxy is not public.** The project started on Playwright; the `healenium-playwright-proxy` repo returns 404 and the only Playwright integration on offer is the paid *Healenium Pro*. The free, open-source path is Selenium/WebDriver, so I migrated the runner to WebdriverIO, which speaks that protocol natively and needs no plugin, just three config lines.
- **WebDriver BiDi silently defeats the proxy.** WebdriverIO v9 negotiates BiDi and resolves elements over a WebSocket that goes straight to the browser. Healenium never sees a single locator. `wdio:enforceWebDriverClassic: true` is mandatory, not optional.
- **Healenium indexes its history by the locator itself.** So it repairs locators broken because the *page* changed, not locators edited in code. My first demo changed the selector in the test and never healed. The working demo keeps the locator fixed and swaps the page instead.
- **The official `docker-compose` has two traps:** 2023 image tags whose session teardown breaks WebdriverIO v9, and a Postgres container with no named volume, which silently wipes everything Healenium has learned on any container recreation.

**How to run it.**

```bash
npm install
npm test                 # 12 scenarios, local Chrome, no Docker needed

npm run healenium:up     # start the 8-container stack and wait for it
npm run healenium:demo   # prove a broken locator gets healed
npm run healenium:down   # stop, keeping what Healenium learned
```

Healing is verified end to end: `hlm-proxy` logs the repair at a similarity score of **0.972**, and the whole flow works from a clean database.

> The rest of this documentation is in Spanish, including a README in every folder.

---

## Qué hay aquí y de qué depende cada parte

Esto es importante antes de nada, porque condiciona cómo interpretar un CI en rojo:

### `features/site/`: depende de una web de terceros

12 escenarios contra [ceizaketines.es](https://ceizaketines.es). Si esa web cambia su maquetación, cae, o modifica un texto, **estos escenarios fallan y el CI se pone rojo sin que este repositorio tenga ningún problema**. Es una limitación asumida a propósito: automatizar contra una web real destapa problemas que una web de laboratorio nunca te enseña (contenido asíncrono, marcado muerto, solapamientos por viewport).

Los tests son de solo lectura: navegan y comprueban, no envían formularios ni generan datos en el sitio.

Si al entrar ves el CI en rojo, mira primero si el fallo viene de aquí.

### `features/healing/`: autocontenida

La demo de auto-sanación **no toca internet**. Corre contra páginas HTML locales servidas por un nginx del propio stack Docker. Es determinista y reproducible: si falla, el problema está de verdad en el proyecto.

Es también la parte que demuestra lo que da título al repo, así que está deliberadamente aislada de la anterior.

---

## Índice

| Carpeta | Qué encontrarás |
|---|---|
| [`features/`](features/) | Qué es Gherkin, qué es Cucumber y cómo se organizan los tests |
| [`features/site/`](features/site/) | La suite contra ceizaketines.es, por niveles |
| [`features/healing/`](features/healing/) | La demo de auto-sanación y cómo trastear con ella |
| [`healenium/`](healenium/) | El stack Docker: qué hace cada uno de los 8 contenedores |
| [`scripts/`](scripts/) | La orquestación de la demo en dos fases |

> **Sobre el idioma:** el código y los escenarios están en inglés (es lo estándar en automatización y lo que espera cualquier equipo internacional). Los comentarios y toda la documentación, en español, para que se entienda el *porqué* de cada decisión.

---

## Arranque rápido

```bash
npm install
npm test          # 12 escenarios en Chrome local. No necesita Docker.
```

Para la parte de Healenium hace falta **Docker Desktop arrancado**:

```bash
npm run healenium:up     # levanta los 8 contenedores y espera a que respondan
npm run healenium:demo   # demuestra la sanación de un localizador roto
npm run healenium:down   # para el stack conservando lo aprendido
```

---

## Por qué WebdriverIO y no Playwright

Este proyecto empezó en **Playwright + playwright-bdd**. Al ir a integrar Healenium apareció el problema: el proxy de Healenium para Playwright (`healenium-playwright-proxy`) **no es público**. La única integración Playwright que Healenium ofrece es **Healenium Pro**, un producto de pago (AMI en AWS Marketplace, facturado por horas).

La integración original y 100 % open source de Healenium es para clientes **Selenium/WebDriver**, vía `healenium-proxy`: un proxy que habla el protocolo WebDriver estándar. WebdriverIO habla ese protocolo de forma nativa, así que apuntarlo al proxy en lugar de a un driver **no necesita ningún plugin**, solo tres líneas de configuración.

Los 12 escenarios Gherkin sobrevivieron intactos a la migración; solo tuve que reescribir los step definitions (`page` de Playwright a `$`/`$$`/`browser` de WebdriverIO).

---

## Cómo funciona

```
  npm test                          npm run test:healed / healenium:demo
      │                                        │
      ▼                                        ▼
 WebdriverIO ──────────────────────────► hlm-proxy :8085
 (Chrome local,                                │
  sin Docker)                                  │ reenvía cada comando WebDriver
                                               │ y vigila las respuestas
                                               ▼
                                        selenium-hub :4444
                                          ├── node-chrome
                                          └── node-firefox
                                               │
                    ¿"no such element"? ───────┘
                                               │
                                               ▼
                              healenium-backend :7878 ──► postgres-db
                                               │          (huellas del DOM)
                                               ▼
                                     selector-imitator :8000
                                     (convierte el nodo hallado
                                      en un selector usable)
```

**En una frase:** en cada búsqueda con éxito, Healenium guarda una "huella" del elemento (su cadena de ancestros en el DOM). Cuando un localizador deja de encontrar nada, compara el DOM actual contra esa huella, puntúa los candidatos y devuelve el más parecido como si el localizador original hubiera funcionado.

Todas las imágenes del stack son públicas y con licencia Apache 2.0 (`healenium/hlm-*` más las oficiales `selenium/*`). **No hay ningún componente de pago.**

---

## Comandos

| Comando | Qué hace | ¿Docker? | ¿Internet? |
|---|---|---|---|
| `npm test` | Los 12 escenarios en Chrome local | No | **Sí** |
| `npm run test:healed` | Los mismos 12, vía el proxy de Healenium | Sí | **Sí** |
| `npm run typecheck` | Comprobación de tipos con `tsc` | No | No |
| `npm run healenium:up` | Levanta el stack y **espera** a que todo responda | Sí | No |
| `npm run healenium:down` | Para el stack **conservando** el histórico | Sí | No |
| `npm run healenium:reset` | Para el stack y **borra** el histórico (`down -v`) | Sí | No |
| `npm run healenium:demo` | Demo de sanación en dos fases | Sí | No |
| `npm run healenium:playground` | El escenario contra la página que puedes editar tú | Sí | No |

> **Importante:** espera a que `healenium:up` termine del todo antes de lanzar tests. Healenium guarda sus huellas sin esperar respuesta (*fire-and-forget*), así que una ejecución que empiece mientras el backend arranca **pasará en verde pero no habrá aprendido nada**, y el fallo solo se ve después, como un localizador que no se sana.

---

## Demostrar que la sanación ocurre de verdad

Que `npm test` pase no demuestra nada sobre la sanación: usa selectores que hoy funcionan. Lo que sí lo demuestra es `npm run healenium:demo`.

La clave está en **qué cambia entre las dos fases**. Healenium indexa su histórico **por el propio localizador**, así que solo repara localizadores rotos porque la *página* cambió, no localizadores editados en el código. Por eso la demo mantiene el localizador fijo y cambia la página:

1. **Fase 1** con `http://test-page/v1/`: el botón aún tiene `class="btn btn-success btn-lg"`, el XPath lo encuentra, y el backend guarda su huella.
2. **Fase 2** con `http://test-page/v2/`: la misma página tras un "rediseño" (`btn-lg` pasa a `btn-xl`). El XPath ya no encuentra nada, y el escenario **debe pasar igualmente** porque el proxy sana el localizador con la huella de la fase 1.

Verificado. El propio proxy lo registra:

```
Find Element Request: {"using":"xpath","value":"(//a[@class=\"btn btn-success btn-lg\"])[3]"}
WARN  Failed to find an element using locator By.xpath: (//a[@class="btn btn-success btn-lg"])[3]
WARN  Reason: no such element: Unable to locate element
WARN  Trying to heal...
WARN  Using healed locator: Scored(score=0.972005772005772,
      value=By.cssSelector: div.my-2.text-center.col-md > a.btn-xl.btn-success.btn[href='javascript:void(0)'])
Find Element Response: {"value":{"element-6066-11e4-a52e-4f735466cecf":"..."}}
```

Para experimentar por tu cuenta hay una página editable en [`healenium/test-page/playground/`](healenium/test-page/playground/index.html): la rompes a mano y relanzas `npm run healenium:playground`. Detalles en [`features/healing/`](features/healing/).

---

## Lo que conviene saber antes de usar Healenium en serio

Cosas que aprendí montando esto y que no suelen estar en los tutoriales:

**No arregla tu código.** Sana en ejecución; tu repositorio sigue teniendo el localizador roto. Si nadie revisa los informes, acumulas deuda invisible: tests en verde sobre selectores muertos. Más aún: comprobé que **la huella tampoco se actualiza** tras sanar, así que seguirá sanando indefinidamente contra la referencia original.

**Puede sanar al elemento equivocado.** Es el riesgo real. Si un rediseño elimina un botón, Healenium puede "encontrarlo" en otro parecido y ocultarte un bug de producción. `SCORE_CAP` (0.6 por defecto) es el umbral que lo controla, y se puede desactivar la sanación selector a selector desde su interfaz web.

**Necesita histórico.** Un localizador debe haber funcionado al menos una vez. En tests nuevos no protege de nada.

**Solo cubre "elemento no encontrado".** No ayuda con textos que cambiaron y compruebas en un assert, ni con cambios de comportamiento.

**Es un servicio con estado, no una librería.** Mantienes base de datos, backend y proxy. La BD es el activo: si la borras, vuelves a empezar de cero.

---

## Dos desviaciones deliberadas respecto al ejemplo oficial

- **Versiones de imagen más nuevas** (proxy `3.0.6`, backend `4.0.2`). Los ejemplos oficiales fijan versiones de 2023 cuyo cierre de sesión es incompatible con WebdriverIO v9: el escenario pasa y luego la ejecución falla en `deleteSession`.
- **Volumen nombrado para Postgres.** El ejemplo guarda la BD en la capa de escritura del contenedor, así que cualquier `docker compose up` que lo recree tira por la borda todo lo aprendido. Para una herramienta cuyo valor es el histórico acumulado, eso es una trampa; `healenium:reset` está para cuando de verdad quieras empezar limpio.

Y una tercera pieza que no es opcional: `wdio:enforceWebDriverClassic: true` en `wdio.healenium.conf.ts`. Sin ella, WebdriverIO v9 negocia **WebDriver BiDi** y resuelve los elementos por un WebSocket que va directo al navegador sin pasar por el proxy. Healenium no vería ni un solo localizador y no sanaría nunca nada.

---

## Estado verificado

| Ruta | Estado |
|---|---|
| `npm run typecheck` | ✅ limpio |
| `npm test` (12 escenarios, Chrome local) | ✅ verde |
| `npm run test:healed` (los mismos vía proxy + Selenium Grid) | ✅ verde |
| `npm run healenium:demo` (sanación confirmada en los logs, score 0.972) | ✅ verde |
| Desde cero: `reset`, `up`, `demo` | ✅ verde |

La última fila es la que más importa para quien clone el repo: confirma que el flujo documentado funciona sin depender de estado acumulado en mi máquina.

---

## Mapa del repositorio

```
features/
  site/                   suite contra ceizaketines.es (easy / medium / hard)
    steps/                step definitions: navegación y simulador
  healing/                la demo de auto-sanación, aislada a propósito
    steps/
wdio.shared.conf.ts       configuración común a los dos modos
wdio.conf.ts              modo local, sin Healenium
wdio.healenium.conf.ts    modo a través del proxy de Healenium
healenium/
  docker-compose.yaml     el stack completo autoalojado
  test-page/              páginas v1 / v2 / playground de la demo
scripts/
  healing-demo.mjs        orquestación de la demo en dos fases
```
