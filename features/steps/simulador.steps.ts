import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';

export const { Given, When, Then } = createBdd();

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

When('abro el simulador de cuota', async ({ page }) => {
  await page.getByRole('link', { name: 'Simulación de su cuota' }).click();
  await expect(page.locator('.modal-dialog')).toBeVisible();
});

When('relleno el simulador de {string} con estos datos:', async ({ page }, tab: string, table: DataTable) => {
  if (tab !== 'Renta Conjunta') {
    throw new Error(`Solo está soportado el relleno automático de "Renta Conjunta" (recibido: "${tab}")`);
  }
  for (const { campo, valor } of table.hashes()) {
    const field = conjuntaFieldMap[campo];
    if (!field) throw new Error(`Campo desconocido en el simulador: "${campo}"`);
    const locator = page.locator(`#${field.id}`);
    if (field.kind === 'select') {
      await locator.selectOption(valor);
    } else {
      await locator.fill(valor);
    }
  }
});

When('pulso {string}', async ({ page }, label: string) => {
  await page.getByRole('button', { name: label }).click();
});

When('cambio a la pestaña {string}', async ({ page }, tab: string) => {
  await page.getByRole('link', { name: tab }).click();
});

When('cierro el simulador con {string}', async ({ page }, how: string) => {
  if (how === '×') {
    await page.getByRole('button', { name: 'Close' }).click();
  } else {
    await page.getByRole('button', { name: how }).click();
  }
  await expect(page.locator('.modal-dialog')).toBeHidden();
});

Then('el resultado del simulador muestra un importe total en euros al mes', async ({ page }) => {
  await expect(page.locator('#resultadoTexto')).toContainText(/Total: \d+,\d+€\/mes\./);
});

Then('los campos de {string} son visibles', async ({ page }, tab: string) => {
  const suffix = tabSuffix[tab];
  await expect(page.locator(`#nacimiento${suffix}`)).toBeVisible();
});

Then('los campos de {string} no son visibles', async ({ page }, tab: string) => {
  const suffix = tabSuffix[tab];
  await expect(page.locator(`#nacimiento${suffix}`)).toBeHidden();
});

Then('el campo {string} conserva el valor {string}', async ({ page }, campo: string, valorParcial: string) => {
  const field = conjuntaFieldMap[campo];
  if (!field) throw new Error(`Campo desconocido en el simulador: "${campo}"`);
  await expect(page.locator(`#${field.id}`)).toHaveValue(new RegExp(escapeRegex(valorParcial)));
});
