# `features/site/`: suite contra ceizaketines.es

12 escenarios sobre [ceizaketines.es](https://ceizaketines.es), la web de un centro de educación infantil de Sevilla, organizados en tres niveles de dificultad **creciente a propósito**: si estás aprendiendo, léelos en orden.

> **Esta carpeta depende de un sitio de terceros.** Si esa web cambia su maquetación, modifica un texto o cae, estos escenarios fallan y el CI se pone rojo sin que el repositorio tenga ningún problema. Lo asumí a conciencia: automatizar contra una web real enseña cosas que una web de laboratorio nunca te enseña. La parte que demuestra Healenium ([`../healing/`](../healing/)) no tiene esta dependencia.
>
> Los tests son de **solo lectura**: navegan y comprueban texto, enlaces y atributos. No envían el formulario de reserva, no dejan datos en el sitio y no generan carga apreciable.

```bash
npm test                                       # los 12, en Chrome local
npm test -- --spec features/site/easy.feature  # solo un fichero
```

| Fichero | Escenarios | Qué enseña |
|---|---|---|
| [`easy.feature`](easy.feature) | 5 | Comprobaciones estáticas: título, meta, enlaces visibles |
| [`medium.feature`](medium.feature) | 5 | Navegación entre secciones, atributos, `Scenario Outline` |
| [`hard.feature`](hard.feature) | 4 | Modal con estado, pestañas, Data Tables, recorrido completo |

## Los step definitions

| Fichero | Contiene |
|---|---|
| [`steps/navigation.steps.ts`](steps/navigation.steps.ts) | Navegación, enlaces, textos, encabezados, pie de página |
| [`steps/simulator.steps.ts`](steps/simulator.steps.ts) | El simulador de cuota: modal, pestañas y cálculo |

Escribí los pasos para que fueran **reutilizables**: `the link {string} points to {string}` sirve para cualquier enlace, no solo para el del email. Por eso los tres ficheros `.feature` comparten las mismas definiciones.

## Detalles del sitio que condicionan los tests

Cosas reales de esta web que descubrí al automatizarla y que explican decisiones del código:

**El contenido se renderiza de forma asíncrona.** Por eso el paso `I see a heading containing` espera con `waitUntil` a que exista algún encabezado antes de leerlos, en lugar de asumir que ya están.

**Hay un formulario de contacto oculto en el HTML que nunca se muestra.** La página de Contacto tiene en su marcado un formulario (`#name`, `#email`, `#message`) que no aparece ni en escritorio ni en móvil: la sección real muestra una tarjeta con dirección, teléfonos y email. Los tests comprueban **lo que el usuario ve**, no el marcado muerto.

**El menú se solapa con el carrusel si la ventana es pequeña.** Con la ventana por defecto de Chrome headless (800×600) los enlaces del menú dejan de ser clicables. De ahí el `--window-size=1400,1000` en las dos configuraciones.

**El modal del simulador conserva su estado.** Al cerrarlo y reabrirlo mantiene los valores introducidos y el resultado, porque es el mismo nodo del DOM que se oculta y se vuelve a mostrar. Añadí un escenario que documenta ese comportamiento a propósito, para que nadie lo "arregle" por error más adelante.

**El aviso de copyright usa el año actual.** El test lo calcula con `new Date().getFullYear()` en vez de fijar un año, para que no caduque en enero.

## Diferencias entre WebDriver y Playwright que aparecieron aquí

Esta suite venía de Playwright, y la migración me destapó dos comportamientos que merece la pena conocer:

- **WebDriver no espera a que terminen las animaciones CSS.** Playwright sí, con sus comprobaciones de *actionability*. Por eso el paso que abre el modal incluye una pausa corta tras verlo aparecer: sin ella, el clic llega mientras el fundido de Bootstrap sigue en marcha.
- **El array que devuelve `$$()` de WebdriverIO no es un array normal.** Su `.map()` tiene semántica encadenable propia y revienta con `Promise.all()`. Por eso los textos de los encabezados se leen con un bucle `for` explícito.
