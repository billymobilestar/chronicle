-- Add is_featured column to artists
ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
