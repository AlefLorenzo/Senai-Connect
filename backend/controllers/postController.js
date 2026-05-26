const db = require('../db');

const postController = {
    getAll: async (req, res) => {
        try {
            const query = `
                SELECT p.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
                FROM posts p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
            `;
            const [posts] = await db.query(query);
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar posts' });
        }
    },
    
    create: async (req, res) => {
        try {
            const { content, attachment_url, attachment_type, attachment_name } = req.body;
            const userId = req.user.id;
            
            if (!content) return res.status(400).json({ error: 'O conteúdo do post não pode estar vazio.' });

            const [result] = await db.query(
                'INSERT INTO posts (user_id, content, attachment_url, attachment_type, attachment_name) VALUES (?, ?, ?, ?, ?)',
                [userId, content, attachment_url, attachment_type, attachment_name]
            );
            
            res.status(201).json({ id: result.insertId, message: 'Post criado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar post' });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;
            
            if (!content) return res.status(400).json({ error: 'O conteúdo do post não pode estar vazio.' });

            const [post] = await db.query('SELECT user_id FROM posts WHERE id = ?', [id]);
            if (post.length === 0) return res.status(404).json({ error: 'Post não encontrado.' });
            if (post[0].user_id !== userId) return res.status(403).json({ error: 'Você não tem permissão para editar este post.' });

            await db.query('UPDATE posts SET content = ? WHERE id = ?', [content, id]);
            res.status(200).json({ message: 'Post atualizado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar post' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const [post] = await db.query('SELECT user_id FROM posts WHERE id = ?', [id]);
            if (post.length === 0) return res.status(404).json({ error: 'Post não encontrado.' });
            if (post[0].user_id !== userId) return res.status(403).json({ error: 'Você não tem permissão para excluir este post.' });

            await db.query('DELETE FROM posts WHERE id = ?', [id]);
            res.status(200).json({ message: 'Post excluído com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao excluir post' });
        }
    },

    toggleLike: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const [existing] = await db.query('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?', [id, userId]);
            
            if (existing.length > 0) {
                await db.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [id, userId]);
                res.status(200).json({ message: 'Curtida removida', liked: false });
            } else {
                await db.query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [id, userId]);
                res.status(200).json({ message: 'Post curtido', liked: true });
            }
        } catch (error) {
            res.status(500).json({ error: 'Erro ao alternar curtida' });
        }
    },

    toggleSave: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const [existing] = await db.query('SELECT * FROM saved_posts WHERE post_id = ? AND user_id = ?', [id, userId]);
            
            if (existing.length > 0) {
                await db.query('DELETE FROM saved_posts WHERE post_id = ? AND user_id = ?', [id, userId]);
                res.status(200).json({ message: 'Removido dos salvos', saved: false });
            } else {
                await db.query('INSERT INTO saved_posts (post_id, user_id) VALUES (?, ?)', [id, userId]);
                res.status(200).json({ message: 'Post salvo', saved: true });
            }
        } catch (error) {
            res.status(500).json({ error: 'Erro ao salvar post' });
        }
    },

    getSavedStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const [likeRes] = await db.query('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?', [id, userId]);
            const [saveRes] = await db.query('SELECT 1 FROM saved_posts WHERE post_id = ? AND user_id = ?', [id, userId]);

            res.status(200).json({
                liked: likeRes.length > 0,
                saved: saveRes.length > 0
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar status' });
        }
    }
};

module.exports = postController;
