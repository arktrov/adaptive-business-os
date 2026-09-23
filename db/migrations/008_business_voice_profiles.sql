-- Business configuration is independent of content jobs. Revisions are append-only.
CREATE TABLE business_voice_profiles (
 business_id text NOT NULL REFERENCES businesses(id),
 voice_profile_id uuid NOT NULL,
 version integer NOT NULL CHECK(version > 0),
 status text NOT NULL CHECK(status IN ('CANDIDATE','APPROVED','RETIRED')),
 content_hash text NOT NULL,
 data jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(business_id,voice_profile_id,version),
 CHECK(data->>'business_id'=business_id AND data->>'voice_profile_id'=voice_profile_id::text AND (data->>'version')::integer=version AND data->>'status'=status AND data->>'content_hash'=content_hash)
);
CREATE TRIGGER immutable_voice_profile BEFORE UPDATE OR DELETE ON business_voice_profiles FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation();
CREATE INDEX voice_profiles_business_lookup ON business_voice_profiles(business_id,voice_profile_id,version DESC);
