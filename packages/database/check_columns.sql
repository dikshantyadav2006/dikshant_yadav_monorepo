SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name LIKE '%featured%'
ORDER BY column_name;
