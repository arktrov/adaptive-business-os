-- All imported/catalog tracks receive tenant-local revisions; no cross-business mutable catalog rows.
CREATE TABLE business_music_assets (
 business_id text NOT NULL REFERENCES businesses(id), music_asset_id uuid NOT NULL,
 version integer NOT NULL CHECK(version>0), status text NOT NULL CHECK(status IN ('CANDIDATE','APPROVED','RESTRICTED','RETIRED')),
 content_hash text NOT NULL, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(business_id,music_asset_id,version),
 CHECK(data->>'business_id'=business_id AND data->>'music_asset_id'=music_asset_id::text AND (data->>'version')::integer=version AND data->>'status'=status AND data->>'content_hash'=content_hash)
);
CREATE TRIGGER immutable_music_asset BEFORE UPDATE OR DELETE ON business_music_assets FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation();
CREATE TABLE business_music_preferences (
 business_id text NOT NULL REFERENCES businesses(id), version integer NOT NULL CHECK(version>0),
 content_hash text NOT NULL, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(business_id,version),
 CHECK(data->>'business_id'=business_id AND (data->>'version')::integer=version AND data->>'content_hash'=content_hash)
);
CREATE TRIGGER immutable_music_preferences BEFORE UPDATE OR DELETE ON business_music_preferences FOR EACH ROW EXECUTE FUNCTION forbid_revision_mutation();
CREATE INDEX music_business_status ON business_music_assets(business_id,music_asset_id,version DESC);
