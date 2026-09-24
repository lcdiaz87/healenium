# `features/` — los tests

Aquí viven los escenarios y el código que los ejecuta. Dos carpetas con propósitos muy distintos, separadas a propósito:

| Carpeta | Qué prueba | Depende de |
|---|---|---|
| [`site/`](site/) | La web existente | Internet y que la web siga en pie |
| [`healing/`](healing/) | Que Healenium repara localizadores | Docker (stack levantado) |

**Por qué separadas:** la suite del sitio depende de una web externa que puede cambiar sin avisar, y sirve para comprobar *esa web*. La demo de sanación es determinista, corre sobre páginas locales servidas por nginx, y sirve para comprobar *la herramienta*. Mezclarlas haría que un fallo del sitio pareciera un fallo de Healenium y al revés.

La separación además es lo que permite que `npm test` (sin Docker) ejecute solo la suite del sitio: cada configuración apunta a su carpeta con `specs`, sin filtros por tags.

---

## Gherkin y Cucumber

- **Gherkin** es el *idioma*: `Given / When / Then`. Es solo texto, no se ejecuta.
- **Cucumber** es el *motor* que lee ese texto y lo conecta con funciones ejecutables.

En este proyecto el motor es `@wdio/cucumber-framework`, que por dentro usa `@cucumber/cucumber`. El flujo es:

```
easy.feature                          navigation.steps.ts
──────────────────────                ───────────────────────────────────────
Given I am on the           ────────► Given('I am on the website homepage',
      website homepage                async () => {
                                          await browser.url(BASE_URL);
                                        });
```

Cucumber casa la línea del `.feature` con la cadena registrada en el step definition, extrae los parámetros y ejecuta la función. Si una línea no tiene definición, imprime la plantilla lista para copiar (`snippets: true` en `wdio.shared.conf.ts`).

## Vocabulario que aparece en los ficheros

| Término | Qué es | Dónde verlo |
|---|---|---|
| `Feature` | Agrupa escenarios de una misma funcionalidad | Todos |
| `Background` | Pasos que se ejecutan antes de cada escenario del fichero | `site/easy.feature` |
| `Scenario` | Un caso de prueba | Todos |
| `Scenario Outline` + `Examples` | El mismo escenario repetido por cada fila de la tabla | `site/medium.feature` |
| Data Table | Tabla que se pasa como argumento a un paso | `site/hard.feature` |
| `{string}` | Parámetro capturado entre comillas | Todos los steps |
| `@tag` | Etiqueta para filtrar escenarios | `healing/healing.feature` |

## Convención de idioma

Los `.feature` y los step definitions están **en inglés** (aunque se que Gherkin soporta español con la cabecera `# language: es` (`Dado / Cuando / Entonces`)); los comentarios si están **en español**.
El motivo: el escenario es código compartido con el resto del mundo, pero el *porqué* de cada decisión conviene que se entienda sin fricción de idiomas.


