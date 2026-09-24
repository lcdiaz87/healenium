# `features/healing/`: la demo de auto-sanación

Un solo escenario, con un propósito muy concreto: **demostrar que Healenium repara de verdad un localizador roto**, no solo que la tubería está conectada.

Lo aislé de la suite del sitio a propósito: necesita el stack Docker levantado y corre contra **páginas locales**, no contra ceizaketines.es. Eso lo hace determinista: si falla, el problema está de verdad en el proyecto y no en un sitio de terceros.

```bash
npm run healenium:up      # imprescindible: levanta el stack
npm run healenium:demo    # la demo completa en dos fases
```

---

## La idea que hay que entender

Esta es **la parte que más cuesta pillar** de Healenium, y la aprendí a base de que no funcionara:

> Healenium indexa su histórico **por el propio localizador**.
> Por eso repara localizadores rotos porque la **página** cambió debajo,
> **no** localizadores que tú has editado en el código.

Mi primer diseño de esta demo cambiaba el selector en el test (de `[3]` a `[5]`) y **nunca sanaba**. Healenium respondía:

```
New element locator have not been found. There is no reference data to selector in the database.
- Your locator was changed on the page and not in code.
```

Claro: al cambiarlo en el código, para Healenium era un localizador nuevo sin historial.

La demo correcta hace lo contrario: **el localizador se queda fijo y lo que cambia es la página.**

---

## Cómo funciona la demo, paso a paso

El localizador, definido en [`steps/healing.steps.ts`](steps/healing.steps.ts), es deliberadamente frágil: un XPath posicional, justo el tipo de selector que se rompe con cualquier retoque.

```
(//a[@class="btn btn-success btn-lg"])[3]
```

**Fase 1, aprender** (`http://test-page/v1/`)

1. La página tiene cuatro botones con `class="btn btn-success btn-lg"`.
2. El XPath encuentra el tercero, hace clic, el escenario pasa.
3. El proxy ve la búsqueda exitosa y manda al backend la **huella** del elemento: su cadena de ancestros en el DOM, con tags, posición, clases, atributos y texto.

**Comprobación intermedia**

El script consulta Postgres y verifica que la huella se guardó de verdad. Si hay cero, se para con un mensaje claro en vez de dejar que la fase 2 falle de forma engañosa. Lo añadí porque Healenium guarda sin esperar respuesta: si el backend aún arranca, la fase 1 pasa en verde pero no aprende nada.

**Fase 2, sanar** (`http://test-page/v2/`)

4. Misma página tras un "rediseño": `btn-lg` pasa a `btn-xl` en los cuatro botones.
5. El XPath ya no encuentra nada, así que el Grid devuelve `no such element`.
6. El proxy dispara `Trying to heal...`, compara el DOM nuevo contra la huella de la fase 1 y puntúa los candidatos.
7. Con un score de **0.972** identifica el botón correcto. `selector-imitator` lo traduce a un selector CSS usable.
8. Devuelve el elemento como si nada. **El escenario pasa sin tocar una línea del test.**

```
WARN  Trying to heal...
WARN  Using healed locator: Scored(score=0.972005772005772,
      value=By.cssSelector: div.my-2.text-center.col-md > a.btn-xl.btn-success.btn[href='javascript:void(0)'])
```

Fíjate en que el localizador sanado ya usa la clase nueva `btn-xl`.

---

## Trastear tú mismo

Hay una tercera página pensada para experimentar: [`healenium/test-page/playground/index.html`](../../healenium/test-page/playground/index.html). nginx la sirve montada desde disco, así que **los cambios son inmediatos**, sin reconstruir ni reiniciar nada.

```bash
npm run healenium:playground   # 1. pasa: Healenium aprende dónde está el botón
# ahora edita el HTML y rómpelo
npm run healenium:playground   # 2. debería seguir pasando, sanado
```

Ideas para romperlo (cualquiera vale):

- Cambia `btn-lg` por `btn-xl` en los cuatro enlaces
- Cambia `btn-success` por `btn-primary`
- Añade un quinto botón **antes** del tercero (desplaza el índice `[3]`)
- Reordena los `<div class="text-center col-md my-2">`

Cuanto más cambies, más baja el score. Lo probé cambiando las dos clases a la vez (`btn-success btn-lg` por `btn-primary btn-xl`) y todavía sana, con score **0.947**. Si bajas de `SCORE_CAP` (0.6 por defecto), deja de sanar.

Para ver qué pasó por dentro:

```bash
docker logs hlm-proxy | grep -iE "Trying to heal|healed locator"
```

Y para empezar de cero, borrando lo aprendido:

```bash
npm run healenium:reset && npm run healenium:up
```

---

## Sobre el tag `@healing`

El tag lo puse en el `.feature`; Healenium no toca tu código jamás, ni añade etiquetas ni marca nada. Aquí es informativo: la separación real la hace la carpeta, vía `specs` en cada configuración de WebdriverIO.
