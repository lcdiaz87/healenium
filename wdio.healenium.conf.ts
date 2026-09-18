import type { Options } from '@wdio/types';
import { sharedConfig } from './wdio.shared.conf.js';

/**
 * Run through the Healenium proxy (hlm-proxy) instead of talking to a
 * browser driver directly. hlm-proxy forwards WebDriver commands to the
 * Selenium Grid started by healenium/docker-compose.yaml and, on a failed
 * locator, asks healenium-backend for a healed replacement before retrying.
 * Requires: docker compose -f healenium/docker-compose.yaml up -d
 */
export const config: Options.Testrunner = {
  ...sharedConfig,

  hostname: '127.0.0.1',
  port: 8085,
  protocol: 'http',

  capabilities: [
    {
      browserName: 'chrome',
      acceptInsecureCerts: true,
      // Same window size as the local config: the site's header overlaps the
      // hero carousel on small viewports and the nav links stop being clickable.
      'goog:chromeOptions': {
        args: ['--window-size=1400,1000'],
      },
      // Healenium's proxy only understands classic WebDriver HTTP commands.
      // Without this, WebdriverIO v9 negotiates BiDi and resolves elements
      // over a WebSocket the proxy never sees — so nothing could be healed.
      // It also avoids wdio trying to reach the Grid's internal Docker IP.
      'wdio:enforceWebDriverClassic': true,
    },
  ],
};
