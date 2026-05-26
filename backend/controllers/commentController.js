const db = require('../db');

const commentController = {
    getByPost: async (req, res) => {
        try {
            const { id } = req.params;
            const query = `
                SELECT c.*, u.name as user_name, u.avatar as user_avatar
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.created_at ASC
            `;
            const [comments] = await db.query(query, [id]);
            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar comentários' });
        }
    },

    create: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;

            if (!content) return res.status(400).json({ error: 'Comentário não pode estar vazio.' });

            const [result] = await db.query(
                'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
                [id, userId, content]
            );

            // Retornar o comentário criado para renderização imediata
            const [newComment] = await db.query(`
                SELECT c.*, u.name as user_name, u.avatar as user_avatar
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = ?
            `, [result.insertId]);

            res.status(201).json({ message: 'Comentário adicionado!', comment: newComment[0] });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar comentário' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params; // ID do comentário
            const userId = req.user.id;

            const [comment] = await db.query('SELECT user_id, post_id FROM comments WHERE id = ?', [id]);
            if (comment.length === 0) return res.status(404).json({ error: 'Comentário não encontrado.' });
            
            // Opcional: dono do post também poderia excluir, mas por enquanto só o autor do comentário
            if (comment[0].user_id !== userId) return res.status(403).json({ error: 'Sem permissão para excluir este comentário.' });

            await db.query('DELETE FROM comments WHERE id = ?', [id]);
            res.status(200).json({ message: 'Comentário excluído.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao excluir comentário' });
        }
    }
};

module.exports = commentController;
