import { When, Then } from '@wdio/cucumber-framework';
import type { DataTable } from '@cucumber/cucumber';
import { browser, $, expect } from '@wdio/globals';

/**
 * Traduce los nombres legibles que se usan en los .feature a los ids reales
 * del formulario. Así los escenarios no quedan atados al HTML del sitio:
 * si mañana cambia un id, solo se toca este mapa.
 */
const jointIncomeFields: Record<string, { id: string; kind: 'select' | 'fill' }> = {
  'birth year': { id: 'nacimientoconjunta', kind: 'select' },
  'morning club': { id: 'matinalconjunta', kind: 'select' },
  lunch: { id: 'comedorconjunta', kind: 'select' },
  'afternoon club': { id: 'tardeconjunta', kind: 'select' },
  'income box 435': { id: 'renta435conjunta', kind: 'fill' },
  'income box 460': { id: 'renta460conjunta', kind: 'fill' },
  'household members': { id: 'familiaconjunta', kind: 'select' },
};

/** Cada pestaña del simulador usa el mismo formulario con distinto sufijo en los ids. */
const tabSuffix: Record<string, string> = {
  'Renta Conjunta': 'conjunta',
  'Renta Individual': 'separada',
};

When('I open the fee simulator', async () => {
  await $('a=Simulación de su cuota').click();
  await expect($('.modal-dialog')).toBeDisplayed();
  // El click de WebDriver no espera a que terminen las transiciones CSS, a
  // diferencia de las comprobaciones de "actionability" de Playwright. Damos
  // tiempo al fundido de entrada del modal de Bootstrap antes de tocar nada.
  await browser.pause(350);
});

When('I fill the {string} simulator with:', async (tab: string, table: DataTable) => {
  if (tab !== 'Renta Conjunta') {
    throw new Error(`Solo está soportado el relleno automático de "Renta Conjunta" (recibido: "${tab}")`);
  }
  // table.hashes() convierte la tabla del .feature en [{field, value}, ...]
  for (const { field: fieldName, value } of table.hashes()) {
    const field = jointIncomeFields[fieldName];
    if (!field) throw new Error(`Campo desconocido en el simulador: "${fieldName}"`);
    const el = $(`#${field.id}`);
    if (field.kind === 'select') {
      await el.selectByVisibleText(value);
    } else {
      await el.clearValue();
      await el.setValue(value);
    }
  }
});

When('I press {string}', async (label: string) => {
  await $(`button=${label}`).click();
});

When('I switch to the {string} tab', async (tab: string) => {
  await $(`a=${tab}`).click();
});

When('I close the simulator with {string}', async (how: string) => {
  await $(`button=${how}`).click();
  await expect($('.modal-dialog')).not.toBeDisplayed();
});

Then('the simulator result shows a monthly total in euros', async () => {
  await expect($('#resultadoTexto')).toHaveText(/Total: \d+,\d+€\/mes\./);
});

Then('the {string} fields are visible', async (tab: string) => {
  await expect($(`#nacimiento${tabSuffix[tab]}`)).toBeDisplayed();
});

Then('the {string} fields are not visible', async (tab: string) => {
  await expect($(`#nacimiento${tabSuffix[tab]}`)).not.toBeDisplayed();
});

Then('the {string} field still holds {string}', async (fieldName: string, partialValue: string) => {
  const field = jointIncomeFields[fieldName];
  if (!field) throw new Error(`Campo desconocido en el simulador: "${fieldName}"`);
  // Coincidencia parcial: el sitio reformatea "20000" como "20.000,00".
  await expect($(`#${field.id}`)).toHaveValue(expect.stringContaining(partialValue));
});
