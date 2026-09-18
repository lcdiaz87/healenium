import { Given, When, Then } from '@wdio/cucumber-framework';
import { browser, $, $$, expect } from '@wdio/globals';

const BASE_URL = 'https://ceizaketines.es';

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Given('que estoy en la portada de Zaketines', async () => {
  await browser.url(BASE_URL);
});

When('voy a la sección {string}', async (section: string) => {
  await browser.url(`${BASE_URL}/?page=${section}`);
});

When('hago clic en {string} del menú principal', async (label: string) => {
  await $('header').$(`a=${label}`).click();
});

When('hago clic en el botón {string} de la portada', async (label: string) => {
  await $(`a=${label}`).click();
});

Then('la URL contiene {string}', async (fragment: string) => {
  await expect(browser).toHaveUrl(new RegExp(escapeRegex(fragment)));
});

Then('veo un encabezado que contiene {string}', async (text: string) => {
  const pattern = new RegExp(escapeRegex(text), 'i');
  // This page's navigation can render its content asynchronously, so wait
  // for at least one heading to show up before reading them.
  await browser.waitUntil(async () => (await $$('h1, h2, h3, h4, h5, h6')).length > 0, {
    timeout: 5000,
    timeoutMsg: 'La página no mostró ningún encabezado a tiempo',
  });
  // Read texts with a plain loop: wdio's $$() array has custom chainable
  // semantics on .map() that don't play well with Promise.all().
  const headings = await $$('h1, h2, h3, h4, h5, h6');
  const texts: string[] = [];
  for (let i = 0; i < headings.length; i++) {
    texts.push(await headings[i].getText());
  }
  const index = texts.findIndex((t) => pattern.test(t));
  if (index === -1) {
    throw new Error(`Ningún encabezado contiene "${text}". Encabezados encontrados: ${JSON.stringify(texts)}`);
  }
  await expect(headings[index]).toBeDisplayed();
});

Then('veo el texto {string}', async (text: string) => {
  await expect($(`*=${text}`)).toBeDisplayed();
});

Then('la página muestra al menos una imagen', async () => {
  const images = await $$('img');
  if (images.length === 0) {
    throw new Error('No se encontró ninguna imagen en la página');
  }
  await expect(images[0]).toBeDisplayed();
});

Then('el enlace {string} apunta a {string}', async (label: string, href: string) => {
  await expect($(`a=${label}`)).toHaveAttribute('href', href);
});

Then('el botón {string} apunta a {string}', async (label: string, href: string) => {
  await expect($(`a=${label}`)).toHaveAttribute('href', href);
});

Then('el botón {string} es visible', async (label: string) => {
  await expect($(`a=${label}`)).toBeDisplayed();
});

Then('el enlace a {string} contiene {string}', async (_network: string, fragment: string) => {
  await expect($(`a[href*="${fragment}"]`)).toBeDisplayed();
});

Then('el título de la página es {string}', async (title: string) => {
  await expect(browser).toHaveTitle(title);
});

Then('la meta descripción contiene {string}', async (text: string) => {
  await expect($('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining(text));
});

Then('el menú principal muestra los enlaces {string}', async (csv: string) => {
  const header = $('header');
  for (const label of csv.split(',').map((s) => s.trim())) {
    await expect(header.$(`a=${label}`)).toBeDisplayed();
  }
});

Then('el pie de página muestra el aviso de copyright del año actual', async () => {
  const currentYear = new Date().getFullYear();
  // Targeted selector rather than a page-wide text search: wdio's `*=` text
  // strategy doesn't resolve this node consistently across browsers.
  const copyright = $('footer.second p');
  await expect(copyright).toBeDisplayed();
  await expect(copyright).toHaveText(new RegExp(`©\\s*${currentYear}\\s*C\\.E\\.I\\. Zaketines`));
});
