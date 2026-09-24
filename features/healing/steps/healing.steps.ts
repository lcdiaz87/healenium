import { Given, When, Then } from '@wdio/cucumber-framework';
import { browser, $, expect } from '@wdio/globals';

/**
 * El localizador es FIJO en las dos fases de la demo.
 *
 * Healenium indexa su histórico por el propio localizador, así que solo
 * repara localizadores que se han roto porque la página cambió debajo.
 * Cambiarlo aquí sería, para Healenium, un localizador nuevo sin historial.
 *
 * Además es deliberadamente frágil: un XPath posicional (el tercer enlace con
 * esas clases) es justo el tipo de selector que se rompe con cualquier retoque.
 */
const SIMULATOR_LOCATOR = '(//a[@class="btn btn-success btn-lg"])[3]';

/**
 * Qué versión de la página cargar.
 *   - scripts/healing-demo.mjs la fija: fase 1 → /v1/, fase 2 → /v2/
 *   - por defecto apunta a /playground/, que es la copia para trastear a mano
 *     (ver healenium/test-page/playground/index.html)
 */
const pageUrl = process.env.HEAL_DEMO_URL || 'http://test-page/playground/';

Given('I open the healing demo page', async () => {
  await browser.url(pageUrl);
});

When('I click the simulator button using the usual locator', async () => {
  await $(SIMULATOR_LOCATOR).click();
});

Then('the simulator result is shown', async () => {
  await expect($('#resultado')).toBeDisplayed();
});
