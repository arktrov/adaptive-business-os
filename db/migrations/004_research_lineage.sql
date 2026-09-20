-- Additive lineage metadata; never rewrite historical operations/runs/outcomes.
CREATE TABLE research_lineages (
 lineage_id uuid PRIMARY KEY, business_id text NOT NULL, content_job_id uuid NOT NULL,
 logical_input jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(business_id,content_job_id), UNIQUE(business_id,content_job_id,lineage_id),
 FOREIGN KEY(business_id,content_job_id) REFERENCES content_jobs(business_id,id),
 FOREIGN KEY(business_id,content_job_id,lineage_id) REFERENCES research_operations(business_id,content_job_id,id)
);
CREATE TABLE research_execution_revisions (
 operation_id uuid PRIMARY KEY, business_id text NOT NULL, content_job_id uuid NOT NULL,
 lineage_id uuid NOT NULL, execution_revision integer NOT NULL CHECK(execution_revision>0),
 previous_run_id uuid, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(lineage_id,execution_revision),
 UNIQUE(business_id,content_job_id,operation_id,lineage_id,execution_revision),
 FOREIGN KEY(business_id,content_job_id,operation_id) REFERENCES research_operations(business_id,content_job_id,id),
 FOREIGN KEY(business_id,content_job_id,lineage_id) REFERENCES research_lineages(business_id,content_job_id,lineage_id),
 FOREIGN KEY(business_id,content_job_id,previous_run_id) REFERENCES research_attempts(business_id,content_job_id,run_id)
);
ALTER TABLE research_attempts ADD CONSTRAINT research_attempt_lineage_reference UNIQUE(business_id,content_job_id,operation_id,run_id,attempt);
CREATE TABLE research_attempt_lineage (
 run_id uuid PRIMARY KEY, business_id text NOT NULL, content_job_id uuid NOT NULL,
 operation_id uuid NOT NULL, lineage_id uuid NOT NULL, execution_revision integer NOT NULL,
 attempt_number integer NOT NULL CHECK(attempt_number>0),
 UNIQUE(lineage_id,attempt_number),
 FOREIGN KEY(business_id,content_job_id,operation_id,run_id,attempt_number) REFERENCES research_attempts(business_id,content_job_id,operation_id,run_id,attempt),
 FOREIGN KEY(business_id,content_job_id,operation_id,lineage_id,execution_revision) REFERENCES research_execution_revisions(business_id,content_job_id,operation_id,lineage_id,execution_revision)
);
INSERT INTO research_lineages(lineage_id,business_id,content_job_id,logical_input)
 SELECT DISTINCT ON(business_id,content_job_id) id,business_id,content_job_id,request->'input'
 FROM research_operations WHERE operation='research' ORDER BY business_id,content_job_id,created_at,id;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM research_operations p JOIN research_lineages l USING(business_id,content_job_id) WHERE p.operation='research' AND p.request->'input' IS DISTINCT FROM l.logical_input)
 THEN RAISE EXCEPTION 'LEGACY_LOGICAL_INPUT_CONFLICT'; END IF;
END $$;
INSERT INTO research_execution_revisions(operation_id,business_id,content_job_id,lineage_id,execution_revision)
 SELECT p.id,p.business_id,p.content_job_id,l.lineage_id,row_number() OVER(PARTITION BY l.lineage_id ORDER BY p.created_at,p.id)
 FROM research_operations p JOIN research_lineages l USING(business_id,content_job_id) WHERE p.operation='research';
-- Fail closed if legacy operations already reset attempt numbers; never renumber history.
INSERT INTO research_attempt_lineage
 SELECT a.run_id,a.business_id,a.content_job_id,a.operation_id,r.lineage_id,r.execution_revision,a.attempt
 FROM research_attempts a JOIN research_execution_revisions r USING(operation_id);
CREATE FUNCTION attach_research_lineage() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE rev research_execution_revisions%ROWTYPE; last_number integer; last_status text;
BEGIN
 IF (SELECT operation FROM research_operations WHERE id=NEW.operation_id)<>'research' THEN RETURN NEW; END IF;
 SELECT * INTO rev FROM research_execution_revisions WHERE operation_id=NEW.operation_id AND business_id=NEW.business_id AND content_job_id=NEW.content_job_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'RESEARCH_REVISION_REQUIRED' USING ERRCODE='23514'; END IF;
 PERFORM 1 FROM research_lineages WHERE lineage_id=rev.lineage_id FOR UPDATE;
 SELECT m.attempt_number,o.status INTO last_number,last_status FROM research_attempt_lineage m LEFT JOIN research_outcomes o USING(run_id) WHERE m.lineage_id=rev.lineage_id ORDER BY m.attempt_number DESC LIMIT 1;
 IF NEW.attempt<>COALESCE(last_number,0)+1 THEN RAISE EXCEPTION 'NON_MONOTONE_RESEARCH_ATTEMPT' USING ERRCODE='23514'; END IF;
 IF last_number IS NOT NULL AND last_status IS DISTINCT FROM 'FAILED' THEN RAISE EXCEPTION 'PREVIOUS_RESEARCH_ATTEMPT_NOT_FAILED' USING ERRCODE='23514'; END IF;
 INSERT INTO research_attempt_lineage VALUES(NEW.run_id,NEW.business_id,NEW.content_job_id,NEW.operation_id,rev.lineage_id,rev.execution_revision,NEW.attempt);
 RETURN NEW;
END $$;
CREATE TRIGGER research_lineage_membership AFTER INSERT ON research_attempts FOR EACH ROW EXECUTE FUNCTION attach_research_lineage();
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['research_lineages','research_execution_revisions','research_attempt_lineage'] LOOP
 EXECUTE format('CREATE TRIGGER immutable_revision BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation()',t);
 END LOOP;
END $$;

CREATE FUNCTION validate_research_execution_revision() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE logical jsonb; request_input jsonb; kind text; next_revision integer; head uuid; head_status text;
BEGIN
 SELECT logical_input INTO logical FROM research_lineages WHERE lineage_id=NEW.lineage_id AND business_id=NEW.business_id AND content_job_id=NEW.content_job_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'RESEARCH_LINEAGE_SCOPE_REQUIRED' USING ERRCODE='23514'; END IF;
 SELECT operation,request->'input' INTO kind,request_input FROM research_operations WHERE id=NEW.operation_id AND business_id=NEW.business_id AND content_job_id=NEW.content_job_id;
 IF kind IS DISTINCT FROM 'research' OR request_input IS DISTINCT FROM logical THEN RAISE EXCEPTION 'LOGICAL_RESEARCH_INPUT_CHANGED' USING ERRCODE='23514'; END IF;
 SELECT COALESCE(MAX(execution_revision),0)+1 INTO next_revision FROM research_execution_revisions WHERE lineage_id=NEW.lineage_id;
 IF NEW.execution_revision<>next_revision THEN RAISE EXCEPTION 'NON_MONOTONE_EXECUTION_REVISION' USING ERRCODE='23514'; END IF;
 IF next_revision=1 THEN
  IF NEW.operation_id<>NEW.lineage_id OR NEW.previous_run_id IS NOT NULL THEN RAISE EXCEPTION 'INVALID_INITIAL_RESEARCH_REVISION' USING ERRCODE='23514'; END IF;
 ELSE
  SELECT m.run_id,o.status INTO head,head_status FROM research_attempt_lineage m LEFT JOIN research_outcomes o USING(run_id) WHERE m.lineage_id=NEW.lineage_id ORDER BY m.attempt_number DESC LIMIT 1;
  IF head IS DISTINCT FROM NEW.previous_run_id OR head_status IS DISTINCT FROM 'FAILED' THEN RAISE EXCEPTION 'STALE_RESEARCH_REVISION' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_research_revision BEFORE INSERT ON research_execution_revisions FOR EACH ROW EXECUTE FUNCTION validate_research_execution_revision();
