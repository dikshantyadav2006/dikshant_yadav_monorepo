-- Adds homepage_latest_count to site_config for the main portfolio site's
-- "Featured Posts" section. Controls how many latest posts are fetched.
-- Default: 3  (range 1-10 enforced by the API).
ALTER TABLE "site_config"
  ADD COLUMN IF NOT EXISTS "homepage_latest_count" INTEGER NOT NULL DEFAULT 3;
