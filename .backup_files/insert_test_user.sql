-- Insert a test user if not exists
INSERT INTO users (id, email, first_name, last_name, avatar, is_email_verified)
VALUES ('usr_123456', 'user@example.com', 'John', 'Doe', 'https://i.pravatar.cc/150?img=68', true)
ON CONFLICT (id) DO NOTHING; 