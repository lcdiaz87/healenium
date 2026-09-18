import { When, Then } from '@wdio/cucumber-framework';
import { $, expect } from '@wdio/globals';

// The 3rd "btn btn-success btn-lg" link on the homepage is the "Simulación
// de su cuota" trigger. This XPath is deliberately positional/fragile — a
// realistic stand-in for a locator that breaks when the page markup shifts.
// scripts/healing-demo.mjs overrides HEAL_DEMO_SELECTOR with an index that
// no longer matches anything, to force Healenium to heal it.
const DEFAULT_SELECTOR = '(//a[@class="btn btn-success btn-lg"])[3]';
const selector = process.env.HEAL_DEMO_SELECTOR || DEFAULT_SELECTOR;

When('hago clic en el botón usando el selector de la demo de sanación', async () => {
  await $(selector).click();
});

Then('se abre el modal del simulador de cuota', async () => {
  await expect($('.modal-dialog')).toBeDisplayed();
});
