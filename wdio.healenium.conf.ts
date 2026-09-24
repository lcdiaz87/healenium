import { sharedConfig } from './wdio.shared.conf.js';

/**
 * Modo Healenium: en vez de hablar con un driver local, WebdriverIO apunta al
 * proxy de Healenium (hlm-proxy) como si fuera un servidor Selenium normal.
 *
 *   WebdriverIO -> hlm-proxy:8085 -> selenium-hub:4444 -> Chrome
 *                       |
 *              healenium-backend + Postgres
 *
 * El proxy reenvía cada comando WebDriver y vigila las respuestas: cuando una
 * búsqueda devuelve "no such element", pide al backend el elemento más parecido
 * de su histórico y reintenta con él.
 *
 * Requiere el stack levantado: npm run healenium:up
 * Ejecutar con: npm run test:healed
 */
export const config: WebdriverIO.Config = {
  ...sharedConfig,

  specs: ['./features/site/**/*.feature'],

  // Estas tres líneas son TODA la integración con Healenium. No hace falta
  // ningún plugin: el proxy habla el protocolo WebDriver estándar.
  hostname: '127.0.0.1',
  port: 8085,
  protocol: 'http',

  capabilities: [
    {
      browserName: 'chrome',
      acceptInsecureCerts: true,

      // Imprescindible. Sin esto, WebdriverIO v9 negocia WebDriver BiDi y
      // resuelve los elementos por un WebSocket que va directo al navegador,
      // sin pasar por el proxy. Healenium no vería ni un localizador y no
      // podría sanar nada.
      'wdio:enforceWebDriverClassic': true,

      // Mismo tamaño de ventana que en local: los nodos del Grid arrancan con
      // una ventana pequeña y varios escenarios fallaban por solapamiento.
      'goog:chromeOptions': {
        args: ['--window-size=1400,1000'],
      },
    },
  ],
};
