// Two-phase Healenium self-healing demo. Requires the Docker stack running
// (npm run healenium:up) and talks to it through wdio.healenium.conf.ts.
//
// The test's locator is identical in both phases. What changes is the page:
//
//   Phase 1 → http://test-page/v1/  the button still has class "btn btn-success
//             btn-lg", the locator matches, and healenium-backend records a
//             DOM fingerprint of the element it found.
//   Phase 2 → http://test-page/v2/  same page after a "redesign" (btn-lg →
//             btn-xl). The locator now matches nothing. hlm-proxy should spot
//             the failed lookup, ask the backend for the closest match to the
//             fingerprint from phase 1, and let the scenario pass anyway.
//
// That direction matters: Healenium indexes its reference data by the locator,
// so it heals locators broken by page changes — not locators edited in code.
import { spawn, execFileSync } from 'node:child_process';

const V1_URL = 'http://test-page/v1/';
const V2_URL = 'http://test-page/v2/';

// Healenium saves reference data fire-and-forget: if the backend isn't ready
// yet, phase 1 still passes but stores nothing, and phase 2 then fails with a
// misleading "element wasn't found". Check explicitly instead of guessing.
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
      ['wdio', 'run', './wdio.healenium.conf.ts', '--spec', 'features/healenium-demo.feature', '--cucumberOpts.tags=@healing-demo'],
      {
        stdio: 'inherit',
        // Node on Windows refuses to spawn .cmd shims directly (CVE-2024-27980),
        // so npx has to go through the shell there.
        shell: process.platform === 'win32',
        env: { ...process.env, HEAL_DEMO_URL: url },
      },
    );

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed (exit code ${code})`));
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
      '`npm run healenium:up` termine del todo y vuelve a lanzar el demo.',
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
