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
                           # hlm-proxy and a Selenium Grid (waits for all ports)
npm run test:healed       # same 12 scenarios, via hlm-proxy this time
npm run healenium:down
```

## Proving the healing actually happens

`npm test` / `npm run test:healed` only use selectors that work today, so
passing doesn't by itself prove anything gets *healed*. `npm run healenium:demo`
does, in two phases against the same running Docker stack:

1. Runs one scenario with a real (if deliberately fragile, position-based)
   XPath, so `healenium-backend` records it as a known-good element.
2. Runs the exact same scenario with a selector index that matches nothing on
   the page — and expects it to **still pass**, because `hlm-proxy` should
   detect the failed locator and heal it using the snapshot from step 1.

```bash
npm run healenium:up
npm run healenium:demo
```

## What's verified and what isn't

This was built and the Gherkin/TypeScript/WebdriverIO layer was verified
end-to-end against the real site (`npm test`, 3 clean runs, no flakes) — that
part is solid. The Docker/Healenium path (`test:healed` and
`healenium:demo`) was built directly from Healenium's own published
`docker-compose.yaml`, image tags and API, but **has not been run in this
environment** — the machine this was built on has no Docker installed. Run it
yourself (or in CI — `.github/workflows/tests.yml` has a job for exactly this)
before trusting it blindly.

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
