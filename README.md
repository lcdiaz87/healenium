# Zaketines E2E Tests

E2E test suite for [ceizaketines.es](https://ceizaketines.es) (a nursery school site),
written in Gherkin/TypeScript, wired up to **Healenium** so a broken CSS/XPath
selector can be healed automatically at runtime instead of breaking the build.

## Why WebdriverIO, not Playwright

This project started on Playwright + `playwright-bdd`. Healenium's self-healing
proxy for Playwright (`healenium-playwright-proxy`) turned out to **not be
public** — its own official example repo links to a repository that 404s, and
the only working Playwright integration Healenium ships is the paid
**Healenium Pro** product (an AWS Marketplace AMI, billed hourly).

Healenium's original and fully open-source integration is for Selenium/WebDriver
clients, via `healenium-proxy` — a locator-healing proxy that speaks the plain
WebDriver protocol. WebdriverIO speaks that protocol natively, so pointing it at
the proxy instead of a driver needs no extra plugin, just a config change. That's
why this suite runs on WebdriverIO + `@wdio/cucumber-framework` rather than
Playwright: it's the path that's actually free and open source end to end.

The 12 Gherkin scenarios themselves didn't need to change — only the step
definitions (Playwright's `page` API → WebdriverIO's `$`/`$$`/`browser`).

## How it works

```
WebdriverIO  →  hlm-proxy  →  Selenium Grid (selenium-hub + browser nodes)
                    ↕
             healenium-backend + Postgres
             (stores a DOM/selector "fingerprint" every time a locator
              succeeds; on a failed locator, hlm-proxy asks the backend
              for the closest historical match and retries with it)
```

Everything in `healenium/docker-compose.yaml` is a public, Apache-2.0-licensed
Docker Hub image (`healenium/hlm-*` + the official `selenium/*` Grid images) —
no paid component involved.

## Running the tests

```bash
npm install
```

**Plain run, no Healenium** — WebdriverIO manages its own local Chrome:

```bash
npm test
```

**Routed through Healenium** — requires Docker:

```bash
npm run healenium:up      # starts postgres, healenium-backend, selector-imitator,
                           # hlm-proxy, a Selenium Grid and the demo page server,
                           # then waits for all of them to answer
npm run test:healed       # same 12 scenarios, via hlm-proxy this time
npm run healenium:down    # stop, keeping what Healenium has learned
npm run healenium:reset   # stop and wipe the learned selectors too
```

Wait for `healenium:up` to finish before running anything against the stack.
Healenium saves its reference data fire-and-forget, so a test run that starts
while `healenium-backend` is still booting will pass but teach Healenium
nothing — and the failure only shows up later, as a locator that doesn't heal.

## Proving the healing actually happens

`npm test` / `npm run test:healed` only use selectors that work today, so
passing doesn't by itself prove anything gets *healed*. `npm run healenium:demo`
does, in two phases against the same running Docker stack.

The key detail is **what changes between the phases**. Healenium indexes its
reference data by the locator itself, so it heals locators broken by the page
changing underneath them — not locators edited in the test code. So the demo
keeps the locator fixed and swaps the page instead, using two versions served
by the `test-page` nginx container:

1. `http://test-page/v1/` — the button still has `class="btn btn-success btn-lg"`,
   the XPath matches, and `healenium-backend` records a fingerprint of the element.
2. `http://test-page/v2/` — the same page after a "redesign" (`btn-lg` → `btn-xl`).
   The XPath now matches nothing, and the scenario is expected to **still pass**
   because `hlm-proxy` heals the locator using the fingerprint from phase 1.

```bash
npm run healenium:up
npm run healenium:demo
```

Verified working — `hlm-proxy` logs the heal itself:

```
Find Element Request: {"using":"xpath","value":"(//a[@class=\"btn btn-success btn-lg\"])[3]"}
WARN  Failed to find an element using locator By.xpath: (//a[@class="btn btn-success btn-lg"])[3]
WARN  Reason: no such element: Unable to locate element
WARN  Trying to heal...
WARN  Using healed locator: Scored(score=0.972005772005772,
      value=By.cssSelector: div.my-2.text-center.col-md > a.btn-xl.btn-success.btn[href='javascript:void(0)'])
Find Element Response: {"value":{"element-6066-11e4-a52e-4f735466cecf":"..."}}
```

## What's verified

All three paths have been run end to end on this machine:

- `npm test` — 12 scenarios, local Chrome, green.
- `npm run test:healed` — same 12 scenarios routed through `hlm-proxy` and the
  dockerised Selenium Grid, green.
- `npm run healenium:demo` — healing confirmed in the proxy logs (score 0.972).

Two deviations from Healenium's own example repo, both deliberate:

- **Newer image tags** (proxy `3.0.6`, backend `4.0.2`). The examples pin 2023
  versions whose session teardown is incompatible with WebdriverIO v9 — the
  scenario passes and then the run fails on `deleteSession`.
- **A named volume for Postgres.** The example stores the database in the
  container's writable layer, so any `docker compose up` that recreates the
  container throws away everything Healenium has learned. For a tool whose
  whole value is accumulated history, that's a footgun; `healenium:reset` is
  there for when you actually want a clean slate.

`wdio:enforceWebDriverClassic: true` in `wdio.healenium.conf.ts` is also
load-bearing: WebdriverIO v9 otherwise negotiates WebDriver BiDi and resolves
elements over a WebSocket that never passes through the proxy, so nothing would
ever be healed.

## Project structure

```
features/*.feature              Gherkin scenarios (Spanish), by difficulty
features/steps/*.steps.ts       step definitions (TypeScript)
wdio.shared.conf.ts             config shared by both run modes
wdio.conf.ts                    local run, no Healenium
wdio.healenium.conf.ts          routed through hlm-proxy
healenium/docker-compose.yaml   the self-hosted Healenium + Selenium Grid stack
scripts/healing-demo.mjs        the two-phase healing proof
```
