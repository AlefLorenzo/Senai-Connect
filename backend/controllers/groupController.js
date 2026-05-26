const db = require('../db');

const groupController = {
    getAll: async (req, res) => {
        try {
            const loggedUserId = req.user.id;
            const query = `
                SELECT g.*, 
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count,
                EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = ?) as is_member
                FROM groups_table g
                ORDER BY g.created_at DESC
            `;
            const [groups] = await db.query(query, [loggedUserId]);
            res.status(200).json(groups);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar grupos' });
        }
    },

    create: async (req, res) => {
        try {
            const { name, description, icon } = req.body;
            const creatorId = req.user.id;

            if (!name) return res.status(400).json({ error: 'O nome do grupo é obrigatório.' });

            const defaultIcon = icon || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';

            const [result] = await db.query(
                'INSERT INTO groups_table (name, description, creator_id, icon) VALUES (?, ?, ?, ?)',
                [name, description || '', creatorId, defaultIcon]
            );

            const groupId = result.insertId;

            // Criador entra automaticamente no grupo
            await db.query(
                'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
                [groupId, creatorId]
            );

            res.status(201).json({ id: groupId, message: 'Grupo criado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar grupo' });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const loggedUserId = req.user.id;
            const query = `
                SELECT g.*,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count,
                EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = ?) as is_member
                FROM groups_table g
                WHERE g.id = ?
            `;
            const [groups] = await db.query(query, [loggedUserId, id]);
            if (groups.length === 0) return res.status(404).json({ error: 'Grupo não encontrado.' });
            res.status(200).json(groups[0]);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar detalhes do grupo' });
        }
    },

    join: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const [existing] = await db.query(
                'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
                [id, userId]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: 'Você já é membro deste grupo.' });
            }

            await db.query(
                'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
                [id, userId]
            );

            res.status(200).json({ message: 'Entrou no grupo com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao entrar no grupo' });
        }
    },

    leave: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const [existing] = await db.query(
                'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
                [id, userId]
            );

            if (existing.length === 0) {
                return res.status(400).json({ error: 'Você não é membro deste grupo.' });
            }

            await db.query(
                'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
                [id, userId]
            );

            res.status(200).json({ message: 'Saiu do grupo com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao sair do grupo' });
        }
    },

    getMembers: async (req, res) => {
        try {
            const { id } = req.params;
            const query = `
                SELECT u.id, u.name, u.avatar, u.role
                FROM group_members gm
                JOIN users u ON gm.user_id = u.id
                WHERE gm.group_id = ?
                ORDER BY u.name ASC
            `;
            const [members] = await db.query(query, [id]);
            res.status(200).json(members);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar membros do grupo' });
        }
    },

    getPosts: async (req, res) => {
        try {
            const { id } = req.params;
            const loggedUserId = req.user.id;

            // Opcional: Validar se o usuário é membro do grupo para ver o feed.
            // Para maior simplicidade e melhor UX, deixaremos aberto ou validaremos.
            const query = `
                SELECT p.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as liked,
                EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = ?) as saved
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.group_id = ?
                ORDER BY p.created_at DESC
            `;
            const [posts] = await db.query(query, [loggedUserId, loggedUserId, id]);
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar posts do grupo' });
        }
    },

    createPost: async (req, res) => {
        try {
            const { id } = req.params;
            const { content, attachment_url, attachment_type, attachment_name } = req.body;
            const userId = req.user.id;

            if (!content) return res.status(400).json({ error: 'O conteúdo do post não pode estar vazio.' });

            const [result] = await db.query(
                'INSERT INTO posts (user_id, content, group_id, attachment_url, attachment_type, attachment_name) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, content, id, attachment_url, attachment_type, attachment_name]
            );

            res.status(201).json({ id: result.insertId, message: 'Post publicado no grupo!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar post no grupo' });
        }
    }
};

module.exports = groupController;
