# Exported column dictionary

Derived from embedded Sheets interface/expect metadata across all 12 exports, not a fresh live header read. Semantic additions AJ/AK are marked. An absent or generic header in an older export is not proof the live sheet is empty. Module-specific reads/writes are in each scenario audit. All read column types are Make text; logical types require explicit normalization.

## Story Pipeline

| Zero-based key | Exported label |
| --- | --- |
| 0 | Story ID (A) |
| 1 | Topic (B) |
| 2 | Category (C) |
| 3 | Hook (D) |
| 4 | Source Strength (E) |
| 5 | Viral Score (F) |
| 6 | Business Score (G) |
| 7 | Status (H) |
| 8 | Owner (I) |
| 9 | Target Format (J) |
| 10 | Planned Publish (K) |
| 11 | Main Source URL (L) |
| 12 | Notes (M) |
| 13 | Originality Score (N) |
| 14 | Confidence Score (O) |
| 15 | Evaluation Reason (P) |
| 16 | Additional Source URLs (Q) |
| 17 | Fact Status (R) |
| 18 | Fact Summary (S) |
| 19 | Publish Recommendation (T) |
| 20 | Story Driver (U) |
| 21 | Anomaly Hook (V) |
| 22 | Open Loop / Curiosity Gap (W) |
| 23 | Retention Driver (X) |
| 24 | Suspense Score (Y) |
| 25 | Story Mode (Z) |
| 26 | Ending Consequence / Open Question (AA) |
| 27 | Conversation Trigger (AB) |
| 28 | Pinned Comment (AC) |
| 29 | Fact Guard Result (AD) |
| 30 | Fact Guard Notes (AE) |
| 31 | Visual Gate Result (AF) |
| 32 | V004 Eligible (AG) |
| 33 | Automation Job ID (AH) |
| 34 | Last Automation Error (AI) |
| 35 | Required Corrections (AJ) — semantic name from 02B/03 mappings |
| 36 | Script Guardrails (AK) — semantic name from 02B/03 mappings |

## Sources

| Zero-based key | Exported label |
| --- | --- |
| 0 | Source ID (A) |
| 1 | Story ID (B) |
| 2 | Claim / Fact (C) |
| 3 | Source Type (D) |
| 4 | Publisher (E) |
| 5 | URL (F) |
| 6 | Published Date (G) |
| 7 | Verified (H) |
| 8 | Verified By (I) |
| 9 | Risk Level (J) |
| 10 | Notes (K) |
| 11 | Claim ID (L) |
| 12 | Source Tier (M) |
| 13 | Rights Status (N) |
| 14 | License / Rights URL (O) |
| 15 | Attribution Required (P) |
| 16 | Attribution Text (Q) |
| 17 | Fact Guard Status (R) |
| 18 | Evidence Notes (S) |

## Production Pipeline

| Zero-based key | Exported label |
| --- | --- |
| 0 | Production ID (A) |
| 1 | Story ID (B) |
| 2 | Production Status (C) |
| 3 | Final Title (D) |
| 4 | Alternative Titles (E) |
| 5 | Core Angle (F) |
| 6 | Opening Hook (G) |
| 7 | Full Script (H) |
| 8 | Script Word Count (I) |
| 9 | Scene Plan JSON (J) |
| 10 | Visual Direction (K) |
| 11 | Thumbnail Concept (L) |
| 12 | Thumbnail Text (M) |
| 13 | Video Description (N) |
| 14 | Keywords (O) |
| 15 | Comment Question (P) |
| 16 | CTA (Q) |
| 17 | Short Hook 1 (R) |
| 18 | Short Script 1 (S) |
| 19 | Short Hook 2 (T) |
| 20 | Short Script 2 (U) |
| 21 | Source Guardrails (V) |
| 22 | Fact Disclaimer (W) |
| 23 | Target Duration Min (X) |
| 24 | Created At (Y) |
| 25 | Updated At (Z) |
| 26 | Beat Sheet JSON (AA) |
| 27 | Claim Map JSON (AB) |
| 28 | Visual Bible JSON (AC) |
| 29 | Proof Assets JSON (AD) |
| 30 | AI Shot Plan JSON (AE) |
| 31 | Voice Timing JSON (AF) |
| 32 | Timeline Compile Status (AG) |
| 33 | Remotion Project JSON (AH) |
| 34 | Technical QA Status (AI) |
| 35 | Story QA Status (AJ) |
| 36 | Human Approval (AK) |
| 37 | Final Video URL (AL) |
| 38 | YouTube Title (AM) |
| 39 | YouTube Description (AN) |
| 40 | YouTube Pinned Comment (AO) |
| 41 | TikTok Caption (AP) |
| 42 | TikTok Pinned Comment (AQ) |
| 43 | Instagram Caption (AR) |
| 44 | Instagram Pinned Comment (AS) |
| 45 | X Copy (AT) |
| 46 | Story Support Copy (AU) |
| 47 | AI Disclosure Required (AV) |
| 48 | Publish Package Status (AW) |
| 49 | Idempotency Key (AX) |
| 50 | Automation Job ID (AY) |
| 51 | Last Automation Error (AZ) |

## Asset Library

| Zero-based key | Exported label |
| --- | --- |
| 0 | Asset ID (A) |
| 1 | Story ID (B) |
| 2 | Scene (C) |
| 3 | Asset Type (D) |
| 4 | Prompt / Description (E) |
| 5 | Tool (F) |
| 6 | File Link (G) |
| 7 | License / Rights (H) |
| 8 | Status (I) |
| 9 | Cost (J) |
| 10 | Notes (K) |
| 11 | Provider Job ID (L) |
| 12 | Idempotency Key (M) |
| 13 | File Hash (N) |
| 14 | Duration ms (O) |
| 15 | Width (P) |
| 16 | Height (Q) |
| 17 | AI Generated (R) |
| 18 | Public URL (S) |
| 19 | Source ID (T) |
| 20 | QA Status (U) |
| 21 | Last Error (V) |

## Platform Analytics

| Zero-based key | Exported label |
| --- | --- |
| 0 | Date (A) |
| 1 | Content ID (B) |
| 2 | Platform (C) |
| 3 | Format (D) |
| 4 | Title (E) |
| 5 | Impressions (F) |
| 6 | Views (G) |
| 7 | Watch Time (min) (H) |
| 8 | Avg View Duration (sec) (I) |
| 9 | Completion % (J) |
| 10 | Likes (K) |
| 11 | Comments (L) |
| 12 | Shares (M) |
| 13 | Saves (N) |
| 14 | Followers Gained (O) |
| 15 | Revenue € (P) |
| 16 | Notes (Q) |
| 17 | Reach (R) |
| 18 | Total Interactions (S) |
| 19 | Reposts (T) |
| 20 | Skip Rate % (U) |
| 21 | Post URL (V) |
| 22 | Retrieved At (W) |
| 23 | Instagram ID (X) |
