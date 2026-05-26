const db = require('../db');

const userController = {
    getProfile: async (req, res) => {
        try {
            const { id } = req.params;
            const [users] = await db.query(
                'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?',
                [id]
            );
            if (users.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
            res.status(200).json(users[0]);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { id } = req.params;
            const { avatar, bio } = req.body;
            const loggedUserId = req.user.id;

            if (parseInt(id) !== loggedUserId) {
                return res.status(403).json({ error: 'Você não tem permissão para editar este perfil.' });
            }

            await db.query(
                'UPDATE users SET avatar = ?, bio = ? WHERE id = ?',
                [avatar, bio, id]
            );

            res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }
    },

    getUserPosts: async (req, res) => {
        try {
            const { id } = req.params;
            const loggedUserId = req.user.id;
            const query = `
                SELECT p.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as liked,
                EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = ?) as saved
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.user_id = ? AND p.group_id IS NULL
                ORDER BY p.created_at DESC
            `;
            const [posts] = await db.query(query, [loggedUserId, loggedUserId, id]);
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar posts do usuário' });
        }
    },

    getUserSaved: async (req, res) => {
        try {
            const { id } = req.params;
            const loggedUserId = req.user.id;

            if (parseInt(id) !== loggedUserId) {
                return res.status(403).json({ error: 'Não autorizado a ver posts salvos de outros usuários.' });
            }

            const query = `
                SELECT p.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as liked,
                TRUE as saved
                FROM saved_posts sp
                JOIN posts p ON sp.post_id = p.id
                JOIN users u ON p.user_id = u.id
                WHERE sp.user_id = ?
                ORDER BY sp.created_at DESC
            `;
            const [posts] = await db.query(query, [loggedUserId, id]);
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar posts salvos' });
        }
    },

    getUserGroups: async (req, res) => {
        try {
            const { id } = req.params;
            const query = `
                SELECT g.*, 
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count
                FROM group_members gm
                JOIN groups_table g ON gm.group_id = g.id
                WHERE gm.user_id = ?
            `;
            const [groups] = await db.query(query, [id]);
            res.status(200).json(groups);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar grupos do usuário' });
        }
    }
};

module.exports = userController;
