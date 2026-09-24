import { sharedConfig } from './wdio.shared.conf.js';

/**
 * Modo local: WebdriverIO descarga y gestiona su propio Chrome, sin Docker
 * y sin Healenium de por medio.
 *
 * Es la red de seguridad del proyecto: si un test falla aquí, el problema
 * está en el test o en la web; si falla solo en modo Healenium, el problema
 * está en la capa de sanación. Esa comparación ahorra muchísimo tiempo.
 *
 * Ejecutar con: npm test
 */
export const config: WebdriverIO.Config = {
  ...sharedConfig,

  // Solo la suite del sitio real. La demo de sanación necesita el proxy,
  // así que no tiene sentido lanzarla aquí.
  specs: ['./features/site/**/*.feature'],

  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        // El tamaño importa: con la ventana por defecto (800x600) la cabecera
        // del sitio se solapa con el carrusel y los enlaces del menú dejan de
        // ser clicables.
        args: ['--headless=new', '--window-size=1400,1000'],
      },
    },
  ],
};
