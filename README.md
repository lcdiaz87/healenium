# Zaketines E2E Tests

Playwright + Gherkin (playwright-bdd) tests for [ceizaketines.es](https://ceizaketines.es).

## Run

```bash
npm install
npx playwright install
npm test
```

`npm test` generates the tests from `features/*.feature` and runs them.

## Structure

- `features/*.feature` — Gherkin scenarios (Spanish)
- `features/steps/*.steps.ts` — step definitions (TypeScript)
- `npm run steps:gen` — creates empty step stubs for any new/undefined Gherkin step
