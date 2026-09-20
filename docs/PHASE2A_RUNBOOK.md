# Phase 2A local acceptance runbook

No external providers or credentials are involved. Use the existing loopback PostgreSQL Compose stack. All test databases have generated abo_test_* names and are dropped by their owning test; development data is preserved.

```powershell
docker compose up -d postgres
$env:TEST_DATABASE_URL='postgres://abo_dev:abo_dev_password@127.0.0.1:55432/postgres'
npm run acceptance
npm run lint
npm run build
node scripts/check-foundation.mjs
```

These are public local-development placeholder credentials from the existing Compose file, not production secrets. No new secret or .env file is needed. Acceptance runs the complete suite twice, checks actual TAP names against both requirement matrices and writes only local ignored TAP files. Tests start real app processes, kill/restart them, exercise the scoped HTTP endpoints and inspect the UI using installed Edge through Playwright.

For the development app, select DATABASE_URL pointing to the existing adaptive_business_os database, run npm run migrate, then npm start. JSON remains Phase-1-only fallback. To run explicit synthetic jobs via HTTP, enable ENABLE_LOCAL_RESEARCH=1, use content_item_id synthetic:<unique-id>, and explicitly admit the test job to RESEARCH_PENDING through the existing development transition command. Never use that test marker for V005. Provider modes are server configuration only: LOCAL_RESEARCH_MODE success/uncertain/contradiction/provider_failure/parsing_failure/retry and LOCAL_FACT_GUARD_MODE PASS/REVIEW_REQUIRED/REJECT/provider_failure/parsing_failure/retry. Default is local; no environment value selects an external provider.

A failed call requires the same input/key with retry:true. A changed input requires a new key and an appropriately admitted job/revision. REVIEW_REQUIRED and REJECTED are terminal for this scoped phase; no implicit editorial approval or rework flow is added. Interrupted attempts require explicit retry; successful attempts are returned from PostgreSQL without calling the adapter again.

Real-provider integration remains a separate authorized step requiring confirmed input, credentials, bounded costs, adapter-specific timeouts/reconciliation and exactly one controlled Research run. It is not part of this technical gate.
