-- Additive, append-only production planning. No historical rows are rewritten.
CREATE TABLE script_executions (
 id uuid PRIMARY KEY, business_id text NOT NULL, content_job_id uuid NOT NULL,
 lineage_id uuid NOT NULL, revision integer NOT NULL CHECK(revision>0),
 previous_execution_id uuid, fact_guard_run_id uuid NOT NULL,
 idempotency_key text NOT NULL, logical_input_hash text NOT NULL, input_hash text NOT NULL,
 input jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(business_id,content_job_id,id), UNIQUE(business_id,content_job_id,revision),
 UNIQUE(business_id,content_job_id,idempotency_key),
 FOREIGN KEY(business_id,content_job_id) REFERENCES content_jobs(business_id,id),
 FOREIGN KEY(business_id,content_job_id,fact_guard_run_id) REFERENCES research_outcomes(business_id,content_job_id,run_id),
 FOREIGN KEY(business_id,content_job_id,previous_execution_id) REFERENCES script_executions(business_id,content_job_id,id)
);
CREATE TABLE script_response_artifacts (
 execution_id uuid PRIMARY KEY, business_id text NOT NULL, content_job_id uuid NOT NULL,
 payload jsonb NOT NULL, content_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(business_id,content_job_id,execution_id) REFERENCES script_executions(business_id,content_job_id,id)
);
CREATE TABLE script_outcomes (
 execution_id uuid PRIMARY KEY,business_id text NOT NULL,content_job_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN ('SUCCEEDED','FAILED','REVIEW_REQUIRED')), validation jsonb NOT NULL,
 metadata jsonb NOT NULL, completed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(business_id,content_job_id,execution_id),
 FOREIGN KEY(business_id,content_job_id,execution_id) REFERENCES script_executions(business_id,content_job_id,id)
);
CREATE TABLE script_drafts (
 id uuid PRIMARY KEY,business_id text NOT NULL,content_job_id uuid NOT NULL,execution_id uuid NOT NULL,
 version integer NOT NULL CHECK(version>0),format text NOT NULL CHECK(format IN ('SHORT','LONG')),
 data jsonb NOT NULL,content_hash text NOT NULL,
 UNIQUE(business_id,content_job_id,id),UNIQUE(business_id,content_job_id,format,version),UNIQUE(execution_id,format),
 FOREIGN KEY(business_id,content_job_id,execution_id) REFERENCES script_outcomes(business_id,content_job_id,execution_id)
);
CREATE TABLE production_packages (
 id uuid PRIMARY KEY,business_id text NOT NULL,content_job_id uuid NOT NULL,script_id uuid NOT NULL,
 version integer NOT NULL CHECK(version>0),data jsonb NOT NULL,content_hash text NOT NULL,
 UNIQUE(business_id,content_job_id,id),UNIQUE(script_id,version),
 FOREIGN KEY(business_id,content_job_id,script_id) REFERENCES script_drafts(business_id,content_job_id,id)
);
CREATE TABLE planned_asset_requirements (
 id text PRIMARY KEY,business_id text NOT NULL,content_job_id uuid NOT NULL,package_id uuid NOT NULL,
 data jsonb NOT NULL,
 FOREIGN KEY(business_id,content_job_id,package_id) REFERENCES production_packages(business_id,content_job_id,id)
);
CREATE INDEX script_job_lookup ON script_executions(business_id,content_job_id,revision);
CREATE INDEX script_draft_lookup ON script_drafts(business_id,content_job_id,version);
CREATE INDEX package_job_lookup ON production_packages(business_id,content_job_id,version);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['script_executions','script_response_artifacts','script_outcomes','script_drafts','production_packages','planned_asset_requirements'] LOOP
 EXECUTE format('CREATE TRIGGER immutable_revision BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation()',t);
 END LOOP;
END $$;
