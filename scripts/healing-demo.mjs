// Two-phase Healenium self-healing demo. Requires the Docker stack running
// (npm run healenium:up) and talks to it through wdio.healenium.conf.ts.
//
// Phase 1 runs the real, working selector so hlm-proxy/healenium-backend
// record a "healthy" snapshot of the element.
// Phase 2 runs the exact same scenario with a selector that matches nothing
// on the page. If Healenium is doing its job, hlm-proxy detects the failed
// locator, asks healenium-backend for the closest healthy match from phase
// 1, and the scenario still passes.
import { spawn } from 'node:child_process';

const BASELINE_SELECTOR = '(//a[@class="btn btn-success btn-lg"])[3]';
const BROKEN_SELECTOR = '(//a[@class="btn btn-success btn-lg"])[5]';

function runWdio(selector, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${label} ===`);
    console.log(`HEAL_DEMO_SELECTOR = ${selector}\n`);

    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(
      npxCmd,
      ['wdio', 'run', './wdio.healenium.conf.ts', '--spec', 'features/healenium-demo.feature', '--cucumberOpts.tags=@healing-demo'],
      {
        stdio: 'inherit',
        env: { ...process.env, HEAL_DEMO_SELECTOR: selector },
      },
    );

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed (exit code ${code})`));
    });
  });
}

async function main() {
  await runWdio(BASELINE_SELECTOR, 'Fase 1/2 — sembrando el histórico de Healenium con el selector real');
  await runWdio(BROKEN_SELECTOR, 'Fase 2/2 — usando un selector roto a propósito: Healenium debería sanarlo');
  console.log('\nHealenium sanó el selector roto: el escenario pasó igualmente en la fase 2.\n');
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  console.error('Si la fase 2 falló, revisa que healenium/docker-compose.yaml esté levantado (npm run healenium:up) y que FIND_ELEMENTS_AUTO_HEALING esté activo en el servicio "healenium".\n');
  process.exit(1);
});
