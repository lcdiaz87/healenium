import { When, Then } from '@wdio/cucumber-framework';
import type { DataTable } from '@cucumber/cucumber';
import { browser, $, expect } from '@wdio/globals';

const conjuntaFieldMap: Record<string, { id: string; kind: 'select' | 'fill' }> = {
  'año de nacimiento': { id: 'nacimientoconjunta', kind: 'select' },
  'aula matinal': { id: 'matinalconjunta', kind: 'select' },
  comedor: { id: 'comedorconjunta', kind: 'select' },
  'aula de tarde': { id: 'tardeconjunta', kind: 'select' },
  'renta casilla 435': { id: 'renta435conjunta', kind: 'fill' },
  'renta casilla 460': { id: 'renta460conjunta', kind: 'fill' },
  'miembros de familia': { id: 'familiaconjunta', kind: 'select' },
};

const tabSuffix: Record<string, string> = {
  'Renta Conjunta': 'conjunta',
  'Renta Individual': 'separada',
};

When('abro el simulador de cuota', async () => {
  await $('a=Simulación de su cuota').click();
  await expect($('.modal-dialog')).toBeDisplayed();
  // WebDriver's click doesn't wait for CSS transitions to settle the way
  // Playwright's actionability checks do, so give Bootstrap's modal fade-in
  // time to finish before interacting with its contents.
  await browser.pause(350);
});

When('relleno el simulador de {string} con estos datos:', async (tab: string, table: DataTable) => {
  if (tab !== 'Renta Conjunta') {
    throw new Error(`Solo está soportado el relleno automático de "Renta Conjunta" (recibido: "${tab}")`);
  }
  for (const { campo, valor } of table.hashes()) {
    const field = conjuntaFieldMap[campo];
    if (!field) throw new Error(`Campo desconocido en el simulador: "${campo}"`);
    const el = $(`#${field.id}`);
    if (field.kind === 'select') {
      await el.selectByVisibleText(valor);
    } else {
      await el.clearValue();
      await el.setValue(valor);
    }
  }
});

When('pulso {string}', async (label: string) => {
  await $(`button=${label}`).click();
});

When('cambio a la pestaña {string}', async (tab: string) => {
  await $(`a=${tab}`).click();
});

When('cierro el simulador con {string}', async (how: string) => {
  await $(`button=${how}`).click();
  await expect($('.modal-dialog')).not.toBeDisplayed();
});

Then('el resultado del simulador muestra un importe total en euros al mes', async () => {
  await expect($('#resultadoTexto')).toHaveText(/Total: \d+,\d+€\/mes\./);
});

Then('los campos de {string} son visibles', async (tab: string) => {
  const suffix = tabSuffix[tab];
  await expect($(`#nacimiento${suffix}`)).toBeDisplayed();
});

Then('los campos de {string} no son visibles', async (tab: string) => {
  const suffix = tabSuffix[tab];
  await expect($(`#nacimiento${suffix}`)).not.toBeDisplayed();
});

Then('el campo {string} conserva el valor {string}', async (campo: string, valorParcial: string) => {
  const field = conjuntaFieldMap[campo];
  if (!field) throw new Error(`Campo desconocido en el simulador: "${campo}"`);
  await expect($(`#${field.id}`)).toHaveValue(expect.stringContaining(valorParcial));
});
