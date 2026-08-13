import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ceizaketines.es';

// Tests fáciles: comprobaciones básicas de que la web carga y muestra
// los elementos esenciales, sin interacción compleja.
test.describe('Zaketines - Nivel fácil', () => {
  test('la página principal carga con el título correcto', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('C.E.I. ZAKETINES');
  });

  test('la meta descripción identifica el centro y su ubicación', async ({ page }) => {
    await page.goto(BASE_URL);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      'content',
      /Centro de Educación Infantil ZAKETINES/
    );
  });

  test('el menú principal muestra los 5 enlaces de navegación', async ({ page }) => {
    await page.goto(BASE_URL);
    const header = page.locator('header');
    for (const label of ['Inicio', 'Matriculacion', 'Objetivos', 'Instalaciones', 'Contacto']) {
      await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
  });

  test('el botón "RESERVA TU CITA" es visible en la portada', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('link', { name: 'RESERVA TU CITA' })).toBeVisible();
  });

  test('el aviso de copyright aparece en el pie de página', async ({ page }) => {
    await page.goto(BASE_URL);
    const currentYear = new Date().getFullYear();
    await expect(page.getByText(new RegExp(`© ${currentYear} C\\.E\\.I\\. Zaketines`))).toBeVisible();
  });
});
