DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'featured_pinned'
  ) THEN
    ALTER TABLE posts ADD COLUMN featured_pinned BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Added featured_pinned column';
  ELSE
    RAISE NOTICE 'featured_pinned column already exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'featured_banner_image_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN featured_banner_image_id UUID;
    RAISE NOTICE 'Added featured_banner_image_id column';
  ELSE
    RAISE NOTICE 'featured_banner_image_id column already exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'featured_banner_image_meta'
  ) THEN
    ALTER TABLE posts ADD COLUMN featured_banner_image_meta JSONB;
    RAISE NOTICE 'Added featured_banner_image_meta column';
  ELSE
    RAISE NOTICE 'featured_banner_image_meta column already exists';
  END IF;
END $$;
