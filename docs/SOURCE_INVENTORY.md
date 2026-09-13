# Source inventory

Inspected 2026-09-13. The external arktrov-remotion directory was not modified. Relative source paths resolve there. [Source hashes](SOURCE_HASHES.tsv) identify the inspected baseline; it has no Git history.

## Local evidence

Read: package.json, README.md, remotion.config.ts, tsconfig.json; src/index.ts, types.ts, Root.tsx, ProjectComposition.tsx, MakeShortScene.tsx, makeShortTreatment.ts, validateProjectData.ts, VideoComposition.tsx, Captions.tsx, KenBurnsImage.tsx; scripts/render-contract.ts, render-worker.ts, make-handoff.ts, compile-production.ts, compile-make-handoff.ts, production-check.ts, preflight-assets.ts, inspect-compositions.ts and both test files.

Both complete JSON schemas inspected: data/arktrov-project.schema.json and arktrov-production-v2-FINAL.schema.json. V002 and V003 project files were validated programmatically, not fully reviewed editorially.

Read docs/make-scenario-06-render-handoff.md, docs/visual-feasibility-metadata.md and rerender-v004-v4.cmd. The batch script was never executed. README describes an older flow; current Root and compiler code establish actual behavior.

## Drive evidence

| Source | Scope |
| --- | --- |
| APP_BOOTSTRAP_SPEC.md | Fully read; modified 2026-09-13T18:29:16.809Z |
| ARKTROV_APP_QUALITY_GATES.md | Fully read; modified 2026-09-13T15:26:09.756Z |
| ARKTROV OS V1 – Master Database | All 14 tabs identified; headers, Settings, System Map and selected production/asset records inspected |
| Render Queue | Four state directories and completed V004 variants inventoried |
| V004 V4 job.json, result.json, handoff.json | Decoded JSON; SUCCEEDED render, eight shots/nine assets, voice end 53.92s, visual plan end 55s, Pending/null asset QA |
| Assets | Metadata/asset records inspected; no audiovisual review |

[Bootstrap snapshot](sources/APP_BOOTSTRAP_SPEC.md) and [quality snapshot](sources/ARKTROV_APP_QUALITY_GATES.md) retain the extracted technical specification text. These are historical evidence; canonical target policy is QUALITY_GATES.md and the ADRs.

The Drive account was verified as ARKTROV before reads. Private operational links and raw production exports are excluded from the public repository. Scientific claims, license descriptions, prices and platform capabilities were not independently re-verified; these are legacy metadata, not fresh validation.

No Make blueprints, complete row-by-row data audit, final-video inspection or post-publish verification. The System Map mixes plans and components; inventory does not prove deployment.
