-- Desportivo cutover rollback helper (non-authoritative)
-- Authoritative rollback: restore full DB backup.

BEGIN;

-- No destructive table drops here.
-- Optional emergency flags/notes can be added as needed.

-- Example: if application uses feature flags table, disable cutover flags here.
-- UPDATE feature_flags SET enabled = false WHERE name IN (
--   'desportivo_cutover_canonical_training',
--   'desportivo_cutover_canonical_competitions',
--   'desportivo_cutover_profile_athlete_sports_data'
-- );

COMMIT;
