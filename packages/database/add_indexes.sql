CREATE INDEX IF NOT EXISTS posts_status_idx ON posts (status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts (published_at);
CREATE INDEX IF NOT EXISTS posts_featured_idx ON posts (featured);
