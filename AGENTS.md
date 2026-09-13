# Working rules

READ -> VERIFY -> PLAN -> BUILD -> TEST.

Phase 0 only until the owner authorizes implementation. Read docs/MASTER_STATE.md first.
Preserve the external renderer and legacy contracts. Do not run its queue worker during foundation work.
All GitHub actions for this repository use the verified account arktrov. Check active identity and exact remote before pushes. Never modify ZHEM repositories or global Git configuration.
Keep tenant business data separate. ARKTROV-specific content belongs in brand configuration or an explicit legacy adapter, never in the generic core.
Render success does not authorize publishing. Every new artifact requires all mandatory QA gates and a fresh independent judge.
No secrets, real credential references, raw operational exports, or media in Git. Raw Make blueprints stay ignored until sanitized and reviewed.
Do not automatically weaken hard rules or edit production code through learning.
