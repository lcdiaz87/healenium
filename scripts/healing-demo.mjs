// Demo de auto-sanación de Healenium en dos fases.
// Requiere el stack Docker levantado (npm run healenium:up) y habla con él
// a través de wdio.healenium.conf.ts.
//
// El localizador del test es IDÉNTICO en las dos fases. Lo que cambia es la página:
//
//   Fase 1 -> http://test-page/v1/   el botón todavía tiene class="btn btn-success
//             btn-lg", el localizador encuentra el elemento, y healenium-backend
//             guarda una huella del DOM que lo rodea.
//   Fase 2 -> http://test-page/v2/   la misma página tras un "rediseño"
//             (btn-lg -> btn-xl). El localizador ya no encuentra nada. hlm-proxy
//             debe detectar el fallo, pedir al backend el elemento más parecido a
//             la huella de la fase 1, y dejar que el escenario pase igualmente.
//
// La dirección del cambio importa: Healenium indexa su histórico por el
// localizador, así que repara localizadores rotos por cambios en la PÁGINA,
// no localizadores editados en el código.
import { spawn, execFileSync } from 'node:child_process';

const V1_URL = 'http://test-page/v1/';
const V2_URL = 'http://test-page/v2/';
const HEALING_SPEC = 'features/healing/healing.feature';

/**
 * Healenium guarda las huellas sin esperar respuesta (fire-and-forget): si el
 * backend aún no está listo, la fase 1 pasa igualmente pero no guarda nada, y
 * la fase 2 falla luego con un engañoso "element wasn't found".
 * Se comprueba de forma explícita en lugar de suponerlo.
 */
function storedSelectorCount() {
  const out = execFileSync(
    'docker',
    ['exec', 'postgres-db', 'psql', '-U', 'healenium_user', '-d', 'healenium',
      '-t', '-A', '-c', 'SELECT count(*) FROM healenium.selector;'],
    { encoding: 'utf-8' },
  );
  return Number.parseInt(out.trim(), 10);
}

function runWdio(url, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${label} ===`);
    console.log(`HEAL_DEMO_URL = ${url}\n`);

    const child = spawn(
      'npx',
      ['wdio', 'run', './wdio.healenium.conf.ts', '--spec', HEALING_SPEC],
      {
        stdio: 'inherit',
        // En Windows, Node se niega a lanzar directamente los .cmd desde
        // spawn (CVE-2024-27980), así que npx tiene que pasar por la shell.
        shell: process.platform === 'win32',
        env: { ...process.env, HEAL_DEMO_URL: url },
      },
    );

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} falló (código de salida ${code})`));
    });
  });
}

async function main() {
  await runWdio(V1_URL, 'Fase 1/2 — página original: Healenium aprende dónde está el botón');

  const stored = storedSelectorCount();
  if (stored === 0) {
    throw new Error(
      'La fase 1 pasó pero Healenium no guardó ningún selector de referencia.\n' +
      'Normalmente significa que healenium-backend aún no estaba listo. Espera a que\n' +
      '`npm run healenium:up` termine del todo y vuelve a lanzar la demo.',
    );
  }
  console.log(`\nHealenium ha guardado ${stored} selector(es) de referencia.`);

  await runWdio(V2_URL, 'Fase 2/2 — página rediseñada: el localizador ya no vale, Healenium debe sanarlo');
  console.log('\nHealenium sanó el localizador: el escenario pasó sobre la página rediseñada.\n');
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  console.error('Comprueba que el stack esté levantado (npm run healenium:up) y revisa los logs con: docker logs hlm-proxy\n');
  process.exit(1);
});
