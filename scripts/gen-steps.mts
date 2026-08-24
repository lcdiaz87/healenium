/**
 * Detecta los pasos de Gherkin (features/*.feature) que todavía no tienen
 * step definition asociada y crea automáticamente un stub vacío para cada
 * uno en features/steps/pending.steps.ts, listo para rellenar.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PENDING_STEPS_FILE = path.resolve(__dirname, '..', 'features', 'steps', 'pending.steps.ts');
const MISSING_STEPS_HEADER = /Missing step definitions: \d+/;
const MISSING_STEPS_FOOTER = 'Use snippets above to create missing steps.';

function runBddgen(): string {
  try {
    return execSync('npx bddgen', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const { stdout = '', stderr = '' } = error as { stdout?: string; stderr?: string };
    return `${stdout}${stderr}`;
  }
}

function extractMissingStepBlocks(output: string): string[] {
  const headerMatch = output.match(MISSING_STEPS_HEADER);
  if (!headerMatch || !output.includes(MISSING_STEPS_FOOTER)) return [];

  const start = headerMatch.index! + headerMatch[0].length;
  const end = output.indexOf(MISSING_STEPS_FOOTER);
  const section = output.slice(start, end).trim();

  return section
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => /^(Given|When|Then)\(/.test(block));
}

function appendStubs(blocks: string[]): void {
  const header = "import { createBdd } from 'playwright-bdd';\n\nexport const { Given, When, Then } = createBdd();\n";
  const existing = existsSync(PENDING_STEPS_FILE) ? readFileSync(PENDING_STEPS_FILE, 'utf-8').trimEnd() : header;
  const updated = `${existing}\n\n${blocks.join('\n\n')}\n`;
  writeFileSync(PENDING_STEPS_FILE, updated, 'utf-8');
}

function main(): void {
  console.log('Buscando pasos de los .feature sin step definition...\n');
  const output = runBddgen();
  const blocks = extractMissingStepBlocks(output);

  if (blocks.length === 0) {
    console.log('Todos los pasos de los .feature ya tienen step definition. Nada que generar.');
    return;
  }

  appendStubs(blocks);

  console.log(`Se han añadido ${blocks.length} step(s) vacío(s) en:`);
  console.log(`  ${path.relative(process.cwd(), PENDING_STEPS_FILE)}\n`);
  for (const block of blocks) {
    console.log(`  - ${block.split('\n')[0]}`);
  }
  console.log('\nImplementa el cuerpo de cada paso y muévelo al fichero .steps.ts que corresponda.');
}

main();
