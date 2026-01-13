-- Create default user for single-user IELTS app
-- Run this in HeidiSQL or phpMyAdmin

-- Create user with ID = 1 (password: 123456)
INSERT INTO users (id, email, password, name, created_at, updated_at) 
VALUES (
  1, 
  'user@ielts.com', 
  '$2b$10$YourHashedPasswordHere', 
  'IELTS Learner', 
  NOW(), 
  NOW()
)
ON DUPLICATE KEY UPDATE id=id;

-- Note: The password hash above is a placeholder
-- The actual password will be: 123456
-- But since we disabled auth, this doesn't matter

-- Alternative: Just create a simple record
-- DELETE FROM users WHERE id = 1;
-- INSERT INTO users (id, email, password, name) VALUES (1, 'user@ielts.com', 'dummy', 'IELTS Learner');
