-- Clean and reimport vocabulary data
-- Run this in HeidiSQL

-- 1. Delete all progress data first (to avoid foreign key constraint)
DELETE FROM user_vocabulary_progress;
DELETE FROM learning_sessions;

-- 2. Delete all bad vocabulary entries
DELETE FROM vocabularies;

-- 3. Reset auto increment
ALTER TABLE vocabularies AUTO_INCREMENT = 1;

-- Now run the Python import script again to reimport from PDF
