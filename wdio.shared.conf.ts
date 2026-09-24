/**
 * Configuración común a los dos modos de ejecución.
 *
 * El tipo omite `capabilities` y `specs` a propósito: de eso se encargan
 * wdio.conf.ts (Chrome local) y wdio.healenium.conf.ts (a través del proxy),
 * que importan este objeto y lo extienden.
 */
export const sharedConfig: Omit<WebdriverIO.Config, 'capabilities' | 'specs'> = {
  runner: 'local',

  logLevel: 'info',
  bail: 0,

  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'cucumber',
  reporters: ['spec'],

  cucumberOpts: {
    // Carga los step definitions de las dos carpetas (site/ y healing/).
    // Cucumber casa cada línea de un .feature contra estas definiciones.
    import: ['./features/**/steps/**/*.steps.ts'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    // Si un paso de un .feature no tiene definición, imprime la plantilla
    // lista para copiar en lugar de fallar sin más.
    snippets: true,
    source: true,
    strict: false,
    timeout: 60000,
    ignoreUndefinedDefinitions: false,
  },
};
