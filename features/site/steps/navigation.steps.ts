import { Given, When, Then } from '@wdio/cucumber-framework';
import { browser, $, $$, expect } from '@wdio/globals';

const BASE_URL = 'https://ceizaketines.es';
const HEADINGS = 'h1, h2, h3, h4, h5, h6';

/** Escapa los caracteres especiales para poder meter texto literal en una RegExp. */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Given('I am on the Zaketines homepage', async () => {
  await browser.url(BASE_URL);
});

When('I go to the {string} section', async (section: string) => {
  await browser.url(`${BASE_URL}/?page=${section}`);
});

When('I click {string} in the main menu', async (label: string) => {
  // Se acota a <header> porque el pie de página repite los mismos enlaces.
  await $('header').$(`a=${label}`).click();
});

When('I click the {string} button on the homepage', async (label: string) => {
  await $(`a=${label}`).click();
});

Then('the URL contains {string}', async (fragment: string) => {
  await expect(browser).toHaveUrl(new RegExp(escapeRegex(fragment)));
});

Then('I see a heading containing {string}', async (text: string) => {
  const pattern = new RegExp(escapeRegex(text), 'i');

  // Esta web renderiza parte del contenido de forma asíncrona, así que
  // esperamos a que exista al menos un encabezado antes de leerlos.
  await browser.waitUntil(async () => [...(await $$(HEADINGS))].length > 0, {
    timeout: 5000,
    timeoutMsg: 'La página no mostró ningún encabezado a tiempo',
  });

  // El spread convierte el resultado de $$() en un array normal. Sin él,
  // su .map() encadenable propio no funciona con Promise.all() y su .length
  // ni siquiera es un número para TypeScript.
  const headings = [...(await $$(HEADINGS))];
  const texts: string[] = [];
  for (const heading of headings) {
    texts.push(await heading.getText());
  }

  const index = texts.findIndex((t) => pattern.test(t));
  if (index === -1) {
    throw new Error(`Ningún encabezado contiene "${text}". Encabezados encontrados: ${JSON.stringify(texts)}`);
  }
  await expect(headings[index]).toBeDisplayed();
});

Then('I see the text {string}', async (text: string) => {
  await expect($(`*=${text}`)).toBeDisplayed();
});

Then('the page shows at least one image', async () => {
  const images = [...(await $$('img'))];
  if (images.length === 0) {
    throw new Error('No se encontró ninguna imagen en la página');
  }
  await expect(images[0]).toBeDisplayed();
});

Then('the link {string} points to {string}', async (label: string, href: string) => {
  await expect($(`a=${label}`)).toHaveAttribute('href', href);
});

// Mismo comportamiento que el paso anterior, pero con redacción de "botón":
// en esta web los botones son enlaces <a> con estilo de botón.
Then('the button {string} points to {string}', async (label: string, href: string) => {
  await expect($(`a=${label}`)).toHaveAttribute('href', href);
});

Then('the button {string} is visible', async (label: string) => {
  await expect($(`a=${label}`)).toBeDisplayed();
});

// El nombre de la red social solo sirve para que el escenario se lea bien;
// la comprobación real se hace con el fragmento de URL.
Then('the {string} link contains {string}', async (_network: string, fragment: string) => {
  await expect($(`a[href*="${fragment}"]`)).toBeDisplayed();
});

Then('the page title is {string}', async (title: string) => {
  await expect(browser).toHaveTitle(title);
});

Then('the meta description contains {string}', async (text: string) => {
  await expect($('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining(text));
});

Then('the main menu shows the links {string}', async (csv: string) => {
  const header = $('header');
  for (const label of csv.split(',').map((s) => s.trim())) {
    await expect(header.$(`a=${label}`)).toBeDisplayed();
  }
});

Then('the footer shows the copyright notice for the current year', async () => {
  const currentYear = new Date().getFullYear();
  // Selector concreto en lugar de búsqueda de texto por toda la página: la
  // estrategia `*=` de WebdriverIO no resuelve este nodo igual en todos los
  // navegadores (falla en el Chrome del Grid y funciona en el Chrome local).
  const copyright = $('footer.second p');
  await expect(copyright).toBeDisplayed();
  await expect(copyright).toHaveText(new RegExp(`©\\s*${currentYear}\\s*C\\.E\\.I\\. Zaketines`));
});
