const db = require('../db');
const socketHelper = require('../socketHelper');

const storyController = {
    // Busca stories das últimas 24h
    getAll: async (req, res) => {
        try {
            const query = `
                SELECT s.*, u.name as user_name, u.avatar as user_avatar
                FROM stories s
                JOIN users u ON s.user_id = u.id
                WHERE s.expires_at > NOW()
                ORDER BY s.created_at DESC
            `;
            const [stories] = await db.query(query);

            // Agrupa por usuário
            const grouped = {};
            stories.forEach(story => {
                if (!grouped[story.user_id]) {
                    grouped[story.user_id] = {
                        user_id: story.user_id,
                        user_name: story.user_name,
                        user_avatar: story.user_avatar,
                        stories: []
                    };
                }
                grouped[story.user_id].stories.push(story);
            });

            res.status(200).json(Object.values(grouped));
        } catch (error) {
            console.error('Erro ao buscar stories:', error);
            res.status(500).json({ error: 'Erro ao buscar stories.' });
        }
    },

    create: async (req, res) => {
        try {
            const userId = req.user.id;
            const { media_url, media_type, text_content } = req.body;

            if (!media_url && !text_content) {
                return res.status(400).json({ error: 'O story precisa de uma imagem/vídeo ou texto.' });
            }

            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

            const [result] = await db.query(
                'INSERT INTO stories (user_id, media_url, media_type, text_content, expires_at) VALUES (?, ?, ?, ?, ?)',
                [userId, media_url || null, media_type || null, text_content || null, expiresAt]
            );

            // Busca o story criado com dados do user
            const [created] = await db.query(
                `SELECT s.*, u.name as user_name, u.avatar as user_avatar
                 FROM stories s JOIN users u ON s.user_id = u.id
                 WHERE s.id = ?`,
                [result.insertId]
            );

            // Emite via socket para todos
            socketHelper.broadcast('new_story', created[0]);

            res.status(201).json(created[0]);
        } catch (error) {
            console.error('Erro ao criar story:', error);
            res.status(500).json({ error: 'Erro ao criar story.' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const [story] = await db.query('SELECT user_id FROM stories WHERE id = ?', [id]);
            if (story.length === 0) return res.status(404).json({ error: 'Story não encontrado.' });
            if (story[0].user_id !== userId) return res.status(403).json({ error: 'Sem permissão.' });

            await db.query('DELETE FROM stories WHERE id = ?', [id]);
            res.status(200).json({ message: 'Story excluído.' });
        } catch (error) {
            console.error('Erro ao excluir story:', error);
            res.status(500).json({ error: 'Erro ao excluir story.' });
        }
    }
};

module.exports = storyController;
