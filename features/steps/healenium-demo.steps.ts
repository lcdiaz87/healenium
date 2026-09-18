import { Given, When, Then } from '@wdio/cucumber-framework';
import { browser, $, expect } from '@wdio/globals';

// The locator stays FIXED across both phases of the demo — Healenium keys its
// reference data by the locator itself, so healing only kicks in when the page
// changed underneath a locator it has seen succeed before.
const SIMULATOR_LOCATOR = '(//a[@class="btn btn-success btn-lg"])[3]';

// Which version of the page to load. scripts/healing-demo.mjs sets this
// explicitly: phase 1 → v1 (pre-redesign, locator works), phase 2 → v2
// (post-redesign, the button class changed and the locator matches nothing).
// The default points at the playground copy, which is yours to edit by hand:
// run `npm run healenium:playground`, break the markup, run it again.
const pageUrl = process.env.HEAL_DEMO_URL || 'http://test-page/playground/';

Given('que abro la página de la demo de sanación', async () => {
  await browser.url(pageUrl);
});

When('hago clic en el botón del simulador con el localizador de siempre', async () => {
  await $(SIMULATOR_LOCATOR).click();
});

Then('se muestra el resultado del simulador', async () => {
  await expect($('#resultado')).toBeDisplayed();
});
