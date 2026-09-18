import type { Options } from '@wdio/types';
import { sharedConfig } from './wdio.shared.conf.js';

/**
 * Plain local run: WebdriverIO manages its own Chrome + driver, no Healenium
 * proxy involved. Used to verify the Gherkin scenarios and step definitions
 * work against the real site, without requiring the Docker stack.
 */
export const config: Options.Testrunner = {
  ...sharedConfig,

  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--headless=new', '--window-size=1400,1000'],
      },
    },
  ],
};
