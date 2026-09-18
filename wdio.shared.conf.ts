import type { Options } from '@wdio/types';

export const sharedConfig: Options.Testrunner = {
  runner: 'local',

  specs: ['./features/**/*.feature'],

  logLevel: 'info',
  bail: 0,

  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'cucumber',
  reporters: ['spec'],

  cucumberOpts: {
    import: ['./features/steps/**/*.steps.ts'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    // The healing demo scenario is excluded by default: it deliberately uses
    // a broken selector and is only meant to run via `npm run healenium:demo`.
    tags: 'not @healing-demo',
    timeout: 60000,
    ignoreUndefinedDefinitions: false,
  },
};
