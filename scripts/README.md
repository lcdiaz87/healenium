# `scripts/`

## `healing-demo.mjs`

Orquesta la demo de auto-sanación en dos fases. Se lanza con:

```bash
npm run healenium:demo
```

### Qué hace

Ejecuta **el mismo escenario dos veces**, cambiando únicamente la URL de la página:

| Fase | Página | Qué se espera |
|---|---|---|
| 1 | `http://test-page/v1/` | Pasa con normalidad. Healenium guarda la huella del botón |
| — | *(comprobación)* | Consulta Postgres y verifica que la huella existe |
| 2 | `http://test-page/v2/` | El localizador ya no encuentra nada → **debe sanar y pasar igualmente** |

El localizador del test **no cambia nunca**. Es el punto central de toda la demo: Healenium indexa su histórico por el localizador, así que solo repara los que se rompen porque la página cambió debajo. Explicación completa en [`features/healing/`](../features/healing/).

### La comprobación intermedia

Entre las dos fases, el script cuenta las filas de `healenium.selector`:

```js
SELECT count(*) FROM healenium.selector;
```

Si sale cero, se para ahí con un mensaje explicando la causa, en lugar de dejar que la fase 2 falle con un engañoso *"element wasn't found"*.

Esto no es paranoia: Healenium guarda las huellas **sin esperar respuesta**
(*fire-and-forget*). Si el backend todavía está arrancando, la fase 1 pasa en verde sin haber aprendido nada, y el síntoma solo aparece después. Pasó de verdad durante el desarrollo y costó un rato entenderlo.

### Detalle de implementación: `shell: true` en Windows

```js
shell: process.platform === 'win32',
```

Node en Windows **se niega a lanzar ficheros `.cmd` directamente** desde `spawn()`. Como `npx` en Windows es `npx.cmd`, sin esto falla con `spawn EINVAL`. En Linux y macOS no hace falta, de ahí que sea condicional.
