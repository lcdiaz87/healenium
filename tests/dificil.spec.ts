import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ceizaketines.es';

// Tests difíciles: flujos multi-paso con estado (modal, pestañas,
// cálculo dinámico y validación) que combinan varias interacciones.
test.describe('Zaketines - Nivel difícil', () => {
  test('el simulador de cuota (Renta Conjunta) calcula el importe total al completar el formulario', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole('link', { name: 'Simulación de su cuota' }).click();
    const modal = page.locator('.modal-dialog');
    await expect(modal).toBeVisible();

    // Año de nacimiento "2024/2025" para que se muestren todos los campos del bloque conjunto.
    await page.locator('#nacimientoconjunta').selectOption({ index: 0 });
    await page.locator('#matinalconjunta').selectOption('Si');
    await page.locator('#comedorconjunta').selectOption('Si');
    await page.locator('#tardeconjunta').selectOption('Si');
    await page.locator('#renta435conjunta').fill('20000');
    await page.locator('#renta460conjunta').fill('0');
    await page.locator('#familiaconjunta').selectOption({ index: 0 });

    await page.getByRole('button', { name: 'Simular' }).click();

    const resultado = page.locator('#resultadoTexto');
    await expect(resultado).toContainText('Aula matinal');
    await expect(resultado).toContainText('Comedor');
    await expect(resultado).toContainText('Aula de tarde');
    await expect(resultado).toContainText(/Total: \d+,\d+€\/mes\./);
  });

  test('cambiar a la pestaña "Renta Individual" oculta los campos de "Renta Conjunta" y muestra los propios', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('link', { name: 'Simulación de su cuota' }).click();
    await expect(page.locator('.modal-dialog')).toBeVisible();

    await expect(page.locator('#nacimientoconjunta')).toBeVisible();
    await expect(page.locator('#nacimientoseparada')).toBeHidden();

    await page.getByRole('link', { name: 'Renta Individual' }).click();

    await expect(page.locator('#nacimientoconjunta')).toBeHidden();
    await expect(page.locator('#nacimientoseparada')).toBeVisible();
    await expect(page.locator('#renta435separada1')).toBeVisible();
    await expect(page.locator('#renta435separada2')).toBeVisible();

    // Volver a "Renta Conjunta" debe restaurar el estado original.
    await page.getByRole('link', { name: 'Renta Conjunta' }).click();
    await expect(page.locator('#nacimientoconjunta')).toBeVisible();
    await expect(page.locator('#nacimientoseparada')).toBeHidden();
  });

  test('el simulador conserva los valores y el resultado al cerrar y reabrir el modal', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('link', { name: 'Simulación de su cuota' }).click();

    await page.locator('#nacimientoconjunta').selectOption({ index: 0 });
    await page.locator('#matinalconjunta').selectOption('Si');
    await page.locator('#comedorconjunta').selectOption('Si');
    await page.locator('#tardeconjunta').selectOption('Si');
    await page.locator('#renta435conjunta').fill('20000');
    await page.locator('#renta460conjunta').fill('0');
    await page.locator('#familiaconjunta').selectOption({ index: 0 });
    await page.getByRole('button', { name: 'Simular' }).click();
    await expect(page.locator('#resultadoTexto')).toContainText(/Total: \d+,\d+€\/mes\./);

    // Cerrar con la "×" (no con "Salir") y volver a abrir el simulador.
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('.modal-dialog')).toBeHidden();
    await page.getByRole('link', { name: 'Simulación de su cuota' }).click();

    // El modal reutiliza el mismo estado: los datos introducidos y el resultado siguen presentes.
    await expect(page.locator('#renta435conjunta')).toHaveValue(/20.000/);
    await expect(page.locator('#resultadoTexto')).toContainText(/Total: \d+,\d+€\/mes\./);
  });

  test('recorrido completo: portada -> simulador -> Matriculación -> Contacto', async ({ page }) => {
    await page.goto(BASE_URL);

    // 1. Abrir el simulador desde la portada y cerrarlo con "Salir".
    await page.getByRole('link', { name: 'Simulación de su cuota' }).click();
    await expect(page.locator('.modal-dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Salir' }).click();
    await expect(page.locator('.modal-dialog')).toBeHidden();

    // 2. Ir a Matriculación mediante el botón de la portada.
    await page.getByRole('link', { name: 'Matriculación 2026/2027' }).click();
    await expect(page).toHaveURL(/page=matriculacion/);
    await expect(page.getByRole('heading', { name: /Plazo de solicitudes de nueva admisión/ })).toBeVisible();

    // 3. Desde ahí, navegar a Contacto mediante el menú y comprobar que los datos de contacto están disponibles.
    await page.locator('header').getByRole('link', { name: 'Contacto', exact: true }).click();
    await expect(page).toHaveURL(/page=contacto/);
    await expect(page.getByRole('link', { name: 'e.i.zaketines@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:e.i.zaketines@gmail.com'
    );
  });
});
