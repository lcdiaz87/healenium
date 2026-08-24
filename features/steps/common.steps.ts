import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

export const { Given, When, Then } = createBdd();

const BASE_URL = 'https://ceizaketines.es';

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Given('que estoy en la portada de Zaketines', async ({ page }) => {
  await page.goto(BASE_URL);
});

When('voy a la sección {string}', async ({ page }, section: string) => {
  await page.goto(`${BASE_URL}/?page=${section}`);
});

When('hago clic en {string} del menú principal', async ({ page }, label: string) => {
  await page.locator('header').getByRole('link', { name: label, exact: true }).click();
});

When('hago clic en el botón {string} de la portada', async ({ page }, label: string) => {
  await page.getByRole('link', { name: label }).click();
});

Then('la URL contiene {string}', async ({ page }, fragment: string) => {
  await expect(page).toHaveURL(new RegExp(escapeRegex(fragment)));
});

Then('veo un encabezado que contiene {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('heading', { name: new RegExp(escapeRegex(text), 'i') })).toBeVisible();
});

Then('veo el texto {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});

Then('la página muestra al menos una imagen', async ({ page }) => {
  await expect(page.locator('img').first()).toBeVisible();
  expect(await page.locator('img').count()).toBeGreaterThan(0);
});

Then('el enlace {string} apunta a {string}', async ({ page }, label: string, href: string) => {
  await expect(page.getByRole('link', { name: label })).toHaveAttribute('href', href);
});

Then('el botón {string} apunta a {string}', async ({ page }, label: string, href: string) => {
  await expect(page.getByRole('link', { name: label })).toHaveAttribute('href', href);
});

Then('el botón {string} es visible', async ({ page }, label: string) => {
  await expect(page.getByRole('link', { name: label })).toBeVisible();
});

Then('el enlace a {string} contiene {string}', async ({ page }, _network: string, fragment: string) => {
  await expect(page.locator(`a[href*="${fragment}"]`).first()).toBeVisible();
});

Then('el título de la página es {string}', async ({ page }, title: string) => {
  await expect(page).toHaveTitle(title);
});

Then('la meta descripción contiene {string}', async ({ page }, text: string) => {
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    new RegExp(escapeRegex(text))
  );
});

Then('el menú principal muestra los enlaces {string}', async ({ page }, csv: string) => {
  const header = page.locator('header');
  for (const label of csv.split(',').map((s) => s.trim())) {
    await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
});

Then('el pie de página muestra el aviso de copyright del año actual', async ({ page }) => {
  const currentYear = new Date().getFullYear();
  await expect(page.getByText(new RegExp(`© ${currentYear} C\\.E\\.I\\. Zaketines`))).toBeVisible();
});
