ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "canvasData" JSONB,
  ADD COLUMN IF NOT EXISTS "currentVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "canvas_data" JSONB,
  ADD COLUMN IF NOT EXISTS "current_version" INTEGER NOT NULL DEFAULT 0;

UPDATE "posts"
SET
  "canvas_data" = COALESCE("canvas_data", "canvasData"),
  "canvasData" = COALESCE("canvasData", "canvas_data"),
  "current_version" = GREATEST("current_version", "currentVersion"),
  "currentVersion" = GREATEST("currentVersion", "current_version");

CREATE TABLE IF NOT EXISTS "post_versions" (
  "id" UUID PRIMARY KEY,
  "post_id" UUID NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL,
  "canvas_data" JSONB NOT NULL,
  "saved_by_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "change_label" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "post_versions_post_id_version_key" UNIQUE ("post_id", "version")
);

CREATE INDEX IF NOT EXISTS "post_versions_post_id_created_at_idx"
  ON "post_versions" ("post_id", "created_at");

CREATE TABLE IF NOT EXISTS "builder_nodes" (
  "id" TEXT PRIMARY KEY,
  "post_id" UUID NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "position" JSONB NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "builder_nodes_post_id_type_idx"
  ON "builder_nodes" ("post_id", "type");

CREATE TABLE IF NOT EXISTS "builder_edges" (
  "id" TEXT PRIMARY KEY,
  "post_id" UUID NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "source_id" TEXT NOT NULL REFERENCES "builder_nodes"("id") ON DELETE CASCADE,
  "target_id" TEXT NOT NULL REFERENCES "builder_nodes"("id") ON DELETE CASCADE,
  "condition" JSONB,
  "data" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "builder_edges_post_id_source_id_idx"
  ON "builder_edges" ("post_id", "source_id");

CREATE INDEX IF NOT EXISTS "builder_edges_post_id_target_id_idx"
  ON "builder_edges" ("post_id", "target_id");
