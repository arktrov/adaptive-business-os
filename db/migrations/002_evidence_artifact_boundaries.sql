-- Additive upgrade also supports databases migrated before the 001 additions.
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS content_job_id uuid REFERENCES content_jobs(id);
ALTER TABLE evidence_records ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE evidence_records ADD COLUMN IF NOT EXISTS reference text;
ALTER TABLE evidence_records ADD COLUMN IF NOT EXISTS payload jsonb;
ALTER TABLE content_jobs ADD COLUMN IF NOT EXISTS working_title text;
ALTER TABLE content_jobs ADD CONSTRAINT job_business_identity UNIQUE (business_id,id);
ALTER TABLE artifacts ADD CONSTRAINT artifact_job_business FOREIGN KEY (business_id,content_job_id) REFERENCES content_jobs(business_id,id);
ALTER TABLE evidence_records ADD CONSTRAINT evidence_job_business FOREIGN KEY (business_id,job_id) REFERENCES content_jobs(business_id,id);
ALTER TABLE artifacts ADD CONSTRAINT artifact_positive_version CHECK (version > 0);
CREATE INDEX artifact_job_lookup ON artifacts(business_id,content_job_id);
CREATE INDEX evidence_job_lookup ON evidence_records(business_id,job_id);
ALTER TABLE job_state_transitions ADD COLUMN sequence bigint GENERATED ALWAYS AS IDENTITY;
CREATE INDEX transition_order ON job_state_transitions(job_id,sequence);
CREATE FUNCTION forbid_revision_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'IMMUTABLE_RECORD' USING ERRCODE = '23514'; END $$;
CREATE TRIGGER immutable_artifact BEFORE UPDATE OR DELETE ON artifacts FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation();
CREATE TRIGGER immutable_evidence BEFORE UPDATE OR DELETE ON evidence_records FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation();
