CREATE TABLE research_definitions (
 business_id text NOT NULL REFERENCES businesses(id), kind text NOT NULL CHECK(kind IN ('prompt','policy')),
 definition_id text NOT NULL, version text NOT NULL, content_hash text NOT NULL, snapshot jsonb NOT NULL,
 PRIMARY KEY(business_id,kind,definition_id,version)
);
CREATE TABLE research_operations (
 id uuid PRIMARY KEY, business_id text NOT NULL, content_job_id uuid NOT NULL,
 operation text NOT NULL CHECK(operation IN ('research','fact_guard')), idempotency_key text NOT NULL,
 canonical_input_hash text NOT NULL, request jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(business_id,content_job_id,operation,idempotency_key), UNIQUE(business_id,content_job_id,id),
 FOREIGN KEY(business_id,content_job_id) REFERENCES content_jobs(business_id,id)
);
CREATE TABLE research_attempts (
 run_id uuid PRIMARY KEY, business_id text NOT NULL, content_job_id uuid NOT NULL, operation_id uuid NOT NULL,
 attempt integer NOT NULL CHECK(attempt>0), started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(operation_id,attempt), UNIQUE(business_id,content_job_id,run_id), UNIQUE(business_id,content_job_id,operation_id,run_id),
 FOREIGN KEY(business_id,content_job_id,operation_id) REFERENCES research_operations(business_id,content_job_id,id)
);
CREATE TABLE research_outcomes (
 run_id uuid PRIMARY KEY, business_id text NOT NULL, content_job_id uuid NOT NULL, operation_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN ('SUCCEEDED','FAILED')), output jsonb, output_hash text,
 metadata jsonb NOT NULL, error_category text, completed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK ((status='SUCCEEDED' AND output IS NOT NULL AND output_hash IS NOT NULL AND error_category IS NULL) OR (status='FAILED' AND error_category IS NOT NULL AND output IS NULL)),
 UNIQUE(business_id,content_job_id,run_id),
 FOREIGN KEY(business_id,content_job_id,operation_id,run_id) REFERENCES research_attempts(business_id,content_job_id,operation_id,run_id)
);
CREATE UNIQUE INDEX research_one_success ON research_outcomes(operation_id) WHERE status='SUCCEEDED';
CREATE TABLE research_claims (
 business_id text NOT NULL, content_job_id uuid NOT NULL, run_id uuid NOT NULL, claim_id text NOT NULL, data jsonb NOT NULL,
 PRIMARY KEY(business_id,content_job_id,run_id,claim_id),
 FOREIGN KEY(business_id,content_job_id,run_id) REFERENCES research_outcomes(business_id,content_job_id,run_id)
);
CREATE TABLE research_sources (
 business_id text NOT NULL, content_job_id uuid NOT NULL, run_id uuid NOT NULL, source_id text NOT NULL, data jsonb NOT NULL,
 PRIMARY KEY(business_id,content_job_id,run_id,source_id),
 FOREIGN KEY(business_id,content_job_id,run_id) REFERENCES research_outcomes(business_id,content_job_id,run_id)
);
CREATE TABLE research_claim_evidence (
 business_id text NOT NULL, content_job_id uuid NOT NULL, run_id uuid NOT NULL, claim_id text NOT NULL, source_id text NOT NULL, data jsonb NOT NULL,
 PRIMARY KEY(business_id,content_job_id,run_id,claim_id,source_id),
 FOREIGN KEY(business_id,content_job_id,run_id,claim_id) REFERENCES research_claims(business_id,content_job_id,run_id,claim_id),
 FOREIGN KEY(business_id,content_job_id,run_id,source_id) REFERENCES research_sources(business_id,content_job_id,run_id,source_id)
);
CREATE INDEX research_jobs ON research_operations(business_id,content_job_id,created_at);
CREATE INDEX research_attempt_jobs ON research_attempts(business_id,content_job_id,started_at);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['research_definitions','research_operations','research_attempts','research_outcomes','research_claims','research_sources','research_claim_evidence'] LOOP
 EXECUTE format('CREATE TRIGGER immutable_revision BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation()',t);
 END LOOP;
END $$;

ALTER TABLE research_operations ADD COLUMN research_run_id uuid;
ALTER TABLE research_operations ADD CONSTRAINT research_input_fk FOREIGN KEY(business_id,content_job_id,research_run_id) REFERENCES research_outcomes(business_id,content_job_id,run_id);
ALTER TABLE research_operations ADD CONSTRAINT research_input_kind CHECK((operation='research' AND research_run_id IS NULL) OR (operation='fact_guard' AND research_run_id IS NOT NULL));
