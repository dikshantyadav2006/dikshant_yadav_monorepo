DO $$
DECLARE
    col_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'featured_pinned'
    ) INTO col_exists;
    RAISE NOTICE 'featured_pinned column exists: %', col_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'featured_image_id'
    ) INTO col_exists;
    RAISE NOTICE 'featured_image_id column exists: %', col_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'featured_banner_image_id'
    ) INTO col_exists;
    RAISE NOTICE 'featured_banner_image_id column exists: %', col_exists;
END $$;
