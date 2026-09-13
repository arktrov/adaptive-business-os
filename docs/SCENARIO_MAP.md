# Scenario map

Evidence: Master Database System Map, external renderer docs and code. **This is an inventory, not a verified Make blueprint map.** No blueprints supplied.

| Component named by source | Trigger/input per source | Output / dependency | Sheets per source |
| --- | --- | --- | --- |
| 00A Idea Discovery Submit | manual/scheduled | async submission -> 00B | Story Pipeline |
| 00B Idea Discovery Results | async result | collected ideas -> 01 | Story Pipeline |
| 01 Story Evaluator | Status=Idea | evaluated / Research Ready -> 02 | Story Pipeline |
| 02 Research Agent | approved/evaluated story | sources -> Fact Guard | Story Pipeline, Sources |
| Fact Guard | research ready | PASS -> 03 | Sources, Story Pipeline |
| 03 Script & Production Package | Fact Guard PASS | script/package -> 04 and visual plan | Production Pipeline |
| 04 Voice Production | approved script | voice and timing | Production Pipeline, Asset Library |
| Visual / Asset Production | plan and voice | ready assets -> compiler | Production Pipeline, Asset Library |
| Timeline Compiler | assets + timing | Project JSON -> renderer | Production Pipeline |
| Scenario 06 Render Handoff | documented ASSETS_READY / current Make handoff | local Drive queue -> worker result | Exact scenario mappings unverified |
| Remotion Render | compiled JSON | rendered output -> QA | Production Pipeline |
| QA + Human Approval | rendered MP4 | approved candidate -> publisher | Production Pipeline |
| Publisher | approved render | platform posts | Content Calendar |
| 10 Platform Analytics | published content | observations | Platform Analytics |
| 10B Instagram Analytics | published IG content | observations | Platform Analytics |

Workbook labels KEEP/UPGRADE/ADD are historical planning labels, not proof that a capability is deployed. Runway is mentioned there; local production records also name ElevenLabs and OpenAI image generation. API endpoints, active provider models, scheduling details and error handlers remain unverified until exports.

## Relationships and storage

Discovery submit/result pair -> evaluation -> research -> Fact Guard -> script -> voice + visual assets -> compiler -> renderer -> QA/approval -> publishing -> analytics.
Local render queue uses incoming/processing/completed/failed. Current adapter also supports flat Make manifests with synchronized asset files. Root metadata confirms four queue folders and completed V004 variants.

Stable row IDs and exact column positions matter to Make. Read existing data without moving or renaming columns. The workbook contains Story Pipeline, Production Pipeline, Content Calendar, Sources, Asset Library, Platform Analytics, Costs, Build Log, Settings, Visual Gate, Automation Control, System Map, Story Archive and Dashboard.

## Missing blueprint evidence

For every inventory entry: actual trigger/filter, complete inputs/outputs, API/provider config, error routes/status transitions, exact Sheets/Drive mappings, special cases and dependencies must be verified from the export. Scenario 06 documentation does not substitute for the full blueprint. A render handoff JSON is production data, not a Make blueprint.
