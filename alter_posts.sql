USE redesocial;
ALTER TABLE posts ADD COLUMN group_id INT DEFAULT NULL;
ALTER TABLE posts ADD CONSTRAINT fk_posts_group FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE;
