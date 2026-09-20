-- Preserve historical attempt/outcome rows. Relations identify individual evidence, not just a pair.
ALTER TABLE research_claim_evidence ADD COLUMN relation_id text NOT NULL DEFAULT 'legacy';
ALTER TABLE research_claim_evidence DROP CONSTRAINT research_claim_evidence_pkey;
ALTER TABLE research_claim_evidence ADD PRIMARY KEY(business_id,content_job_id,run_id,claim_id,source_id,relation_id);
ALTER TABLE evidence_records ADD CONSTRAINT evidence_scoped_id UNIQUE(business_id,job_id,id);
CREATE TABLE research_processing_revisions (
 id uuid PRIMARY KEY,business_id text NOT NULL,content_job_id uuid NOT NULL,lineage_id uuid NOT NULL,
 original_run_id uuid NOT NULL,artifact_id uuid NOT NULL,artifact_hash text NOT NULL,
 revision integer NOT NULL CHECK(revision>0),provider_call_executed boolean NOT NULL DEFAULT false CHECK(provider_call_executed=false),
 versions jsonb NOT NULL,previous_failure jsonb NOT NULL,reason text NOT NULL CHECK(length(reason)>0),
 output jsonb NOT NULL,output_hash text NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(business_id,content_job_id,id),UNIQUE(original_run_id,revision),UNIQUE(artifact_id,versions),
 FOREIGN KEY(business_id,content_job_id,lineage_id) REFERENCES research_lineages(business_id,content_job_id,lineage_id),
 FOREIGN KEY(business_id,content_job_id,original_run_id) REFERENCES research_outcomes(business_id,content_job_id,run_id),
 FOREIGN KEY(business_id,content_job_id,artifact_id) REFERENCES evidence_records(business_id,job_id,id)
);
CREATE TABLE recovered_research_claims(business_id text NOT NULL,content_job_id uuid NOT NULL,processing_id uuid NOT NULL,claim_id text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(business_id,content_job_id,processing_id,claim_id),FOREIGN KEY(business_id,content_job_id,processing_id) REFERENCES research_processing_revisions(business_id,content_job_id,id));
CREATE TABLE recovered_research_sources(business_id text NOT NULL,content_job_id uuid NOT NULL,processing_id uuid NOT NULL,source_id text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(business_id,content_job_id,processing_id,source_id),FOREIGN KEY(business_id,content_job_id,processing_id) REFERENCES research_processing_revisions(business_id,content_job_id,id));
CREATE TABLE recovered_research_evidence(business_id text NOT NULL,content_job_id uuid NOT NULL,processing_id uuid NOT NULL,relation_id text NOT NULL,claim_id text NOT NULL,source_id text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(business_id,content_job_id,processing_id,relation_id),FOREIGN KEY(business_id,content_job_id,processing_id,claim_id) REFERENCES recovered_research_claims(business_id,content_job_id,processing_id,claim_id),FOREIGN KEY(business_id,content_job_id,processing_id,source_id) REFERENCES recovered_research_sources(business_id,content_job_id,processing_id,source_id));
CREATE INDEX processing_job_lookup ON research_processing_revisions(business_id,content_job_id,created_at);
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['research_processing_revisions','recovered_research_claims','recovered_research_sources','recovered_research_evidence'] LOOP EXECUTE format('CREATE TRIGGER immutable_revision BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation()',t); END LOOP; END $$;
