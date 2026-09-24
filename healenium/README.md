# `healenium/`: el stack Docker

Todo lo que hace falta para que la auto-sanación funcione, autoalojado. Ocho contenedores, todas las imágenes públicas y con licencia Apache 2.0. **Ningún componente de pago.**

```bash
npm run healenium:up      # levanta y espera a que todo responda
npm run healenium:down    # para, conservando lo aprendido
npm run healenium:reset   # para y borra el histórico (down -v)
```

---

## Qué hace cada contenedor

No son ocho piezas de Healenium: son tres grupos distintos.

### Healenium (4)

| Contenedor | Puerto | Función |
|---|---|---|
| `hlm-proxy` | 8085 | El *man-in-the-middle* del protocolo WebDriver. Detecta el fallo y dispara la sanación |
| `healenium` | 7878 | El cerebro: guarda huellas, ejecuta la comparación de similitud, sirve los informes |
| `postgres-db` | 5432 | Persistencia: huellas, sanaciones, informes |
| `selector-imitator` | 8000 | Convierte un nodo del DOM sanado en un selector legible |

### Selenium Grid (3)

`selenium-hub` (4444), `node-chrome` y `node-firefox`. **Esto no es Healenium**, es infraestructura de navegadores: el proxy necesita un servidor WebDriver real detrás al que reenviar los comandos.

### Auxiliar (1)

`test-page` (8090) es un nginx que sirve las páginas de la demo. Tampoco es de Healenium: lo añadí para tener un escenario de sanación determinista, sin depender de ninguna web externa.

---

## Por qué está tan troceado

Cada pieza tiene necesidades distintas: el proxy está en el **camino crítico** de cada comando y debe ser ligero; la comparación de similitud es un Spring Boot con acceso a base de datos; el imitator es un servicio aparte que solo se invoca al sanar.

Esa división explica también el reparto de tiempos:

- **Búsqueda que funciona:** el proxy guarda la huella *fire-and-forget*, sin esperar. Coste casi cero.
- **Búsqueda que falla:** aquí **sí bloquea**, porque necesita el elemento para responder. Lo medí en los logs de este proyecto: **~85 ms**.

Es decir, Healenium solo cuesta tiempo cuando algo ya se ha roto.

---

## Interfaces web

Con el stack levantado:

| URL | Qué muestra |
|---|---|
| http://localhost:7878/healenium/report/ | Informe de sanaciones, con capturas |
| http://localhost:7878/healenium/selectors/ | Listado de selectores aprendidos |
| http://localhost:4444 | Consola del Selenium Grid |
| http://localhost:8090/v1/ | Las páginas de la demo |

En el listado de selectores hay una casilla **"healing enable"** por selector: es la columna `enable_healing` de la base de datos. Desactívala en los elementos donde **prefieras que el test falle** antes que arriesgarte a que sane hacia el elemento equivocado (por ejemplo, un botón crítico que, si desaparece, debe romper la build).


---

## Qué guarda en la base de datos

```
selector          la huella; se escribe en cada búsqueda con éxito
  uid             hash determinista (clave primaria)
  locator         {"type":"By.xpath","value":"..."}  el localizador original
  node_path       cadena de ancestros en JSON  <- LA HUELLA
  enable_healing  la casilla de la interfaz web
  url, class_name, method_name, command, create_date, tenant_id

healing           un registro por incidente de sanación
  uid, selector_id -> selector.uid
  page_content    HTML completo de la página en ese momento
  create_date, tenant_id

healing_result    los candidatos puntuados de cada sanación
  id, healing_id -> healing.uid
  locator         el localizador sanado propuesto
  score           0.972...  la puntuación de similitud
  success_healing si se acabó usando

report            informes agregados
llm, vcs          configuración de Healenium Pro; vacías en open source
databasechangelog control de migraciones de Liquibase
```

Las claves ajenas cuentan la historia entera: `selector` (qué buscabas), luego `healing` (cuándo falló), luego `healing_result` (qué se propuso y con qué nota).

La huella **no es el DOM entero**: es solo la cadena de ancestros hasta el elemento. El HTML completo se guarda únicamente al sanar, en `healing.page_content`.

Para curiosear:

```bash
docker exec postgres-db psql -U healenium_user -d healenium -c "SELECT count(*) FROM healenium.selector;"
docker exec postgres-db psql -U healenium_user -d healenium -c "SELECT score, locator FROM healenium.healing_result;"
```

---

## Dos desviaciones respecto al `docker-compose` oficial

Ambas deliberadas, y ambas porque me choqué con el problema:

**Versiones más nuevas**: proxy `3.0.6`, backend `4.0.2`, imitator `1.6`, Postgres `15.5`. Los ejemplos oficiales fijan versiones de 2023 cuyo cierre de sesión es incompatible con WebdriverIO v9: el escenario pasa y después la ejecución revienta en `deleteSession`.

**Volumen nombrado para Postgres**: el ejemplo oficial guarda la base de datos en la capa de escritura del contenedor. Consecuencia: cualquier `docker compose up` que lo recree (por ejemplo, tras editar el compose) **borra en silencio todo lo aprendido**. Me pasó en mitad del desarrollo y costó entender por qué una demo que funcionaba dejó de sanar. Para una herramienta cuyo valor es el histórico acumulado, es una trampa seria. Aquí hay volumen nombrado, y `healenium:reset` para cuando de verdad quieras empezar limpio.

---

## Variables de entorno que conviene conocer

En `hlm-proxy`:

| Variable | Valor aquí | Qué hace |
|---|---|---|
| `SCORE_CAP` | `.6` | Umbral mínimo de similitud para aceptar una sanación. Súbelo para reducir falsos positivos |
| `RECOVERY_TRIES` | `1` | Intentos de recuperación |
| `HEAL_ENABLED` | `true` | Interruptor general |
| `SELENIUM_SERVER_URL` | `http://selenium-hub:4444/wd/hub` | A dónde reenvía los comandos |

En `healenium` (backend):

| Variable | Valor aquí | Qué hace |
|---|---|---|
| `KEY_SELECTOR_URL` | `false` | Si la URL forma parte de la clave del selector. En `false`, la misma huella vale en páginas distintas |
| `FIND_ELEMENTS_AUTO_HEALING` | `true` | Sanación también en búsquedas múltiples |

## Carpetas generadas

`logs/` y `screenshots/` las crean los contenedores al ejecutarse. Están en `.gitignore`; no hace falta tocarlas.
