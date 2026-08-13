import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ceizaketines.es';

// Tests de nivel medio: navegación entre secciones y verificación de
// contenido/atributos que requieren inspeccionar más de un elemento.
test.describe('Zaketines - Nivel medio', () => {
  const secciones = [
    { link: 'Matriculacion', url: '?page=matriculacion', heading: /Plazo de solicitudes de nueva admisión/ },
    { link: 'Objetivos', url: '?page=objetivos', heading: /ofrecerte/i },
  ];

  for (const { link, url, heading } of secciones) {
    test(`el enlace "${link}" del menú navega a la sección correcta`, async ({ page }) => {
      await page.goto(BASE_URL);
      await page.locator('header').getByRole('link', { name: link, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(url.replace('?', '\\?')));
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    });
  }

  test('el enlace "Contacto" del menú navega a la sección con los datos de contacto', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('header').getByRole('link', { name: 'Contacto', exact: true }).click();
    await expect(page).toHaveURL(/page=contacto/);
    await expect(page.getByText('Venga a vistarnos')).toBeVisible();
    await expect(page.getByText('Avenida Emilio Lemos, 37, A/B, 41020 Sevilla')).toBeVisible();
  });

  test('la sección de Instalaciones muestra la galería de imágenes', async ({ page }) => {
    await page.goto(`${BASE_URL}/?page=instalaciones`);
    await expect(page.locator('img').first()).toBeVisible();
    expect(await page.locator('img').count()).toBeGreaterThan(0);
  });

  test('la página de Contacto muestra el teléfono, el email y el enlace de reserva de cita', async ({ page }) => {
    await page.goto(`${BASE_URL}/?page=contacto`);

    await expect(page.getByRole('link', { name: '611 937 130' })).toHaveAttribute('href', 'tel:611937130');
    await expect(page.getByRole('link', { name: '954 070 101' })).toHaveAttribute('href', 'tel:954070101');
    await expect(page.getByRole('link', { name: 'e.i.zaketines@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:e.i.zaketines@gmail.com'
    );
    await expect(page.getByRole('link', { name: 'https://forms.gle/DcowLvhBiZGvYnWb7' })).toHaveAttribute(
      'href',
      'https://forms.gle/DcowLvhBiZGvYnWb7'
    );
  });

  test('los enlaces a redes sociales apuntan a las cuentas oficiales del centro', async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.locator('a[href*="api.whatsapp.com/send?phone=+34611937130"]')).toHaveCount(1);
    await expect(page.locator('a[href*="facebook.com/CEI-Zaketines"]')).toHaveCount(1);
    await expect(page.locator('a[href*="instagram.com/e.i.zaketines"]')).toHaveCount(1);
    await expect(page.locator('a[href*="tiktok.com/@cei.zaketines"]')).toHaveCount(1);
  });

  test('el botón "RESERVA TU CITA" enlaza al formulario de Google Forms correcto', async ({ page }) => {
    await page.goto(BASE_URL);
    const reserva = page.getByRole('link', { name: 'RESERVA TU CITA' });
    await expect(reserva).toHaveAttribute(
      'href',
      'https://docs.google.com/forms/d/1mxZisi7SXCZg_oDw5tB2QA_5Z6ic5-V8lJYvqSstoCg'
    );
  });
});
