const db = require('../db');
const gamificationHelper = require('../helpers/gamificationHelper');

const projectController = {
    /** Projetos do portfólio de um usuário. */
    getByUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const [projects] = await db.query(
                'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            res.status(200).json(projects);
        } catch (error) {
            console.error('Erro em projects.getByUser:', error);
            res.status(500).json({ error: 'Erro ao buscar projetos' });
        }
    },

    /** Adiciona projeto ao próprio portfólio. */
    create: async (req, res) => {
        try {
            const { title, description, project_url, image_url, tags } = req.body;
            const userId = req.user.id;

            if (!title || !title.trim()) {
                return res.status(400).json({ error: 'O título do projeto é obrigatório.' });
            }

            const [result] = await db.query(
                'INSERT INTO projects (user_id, title, description, project_url, image_url, tags) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, title.trim().slice(0, 150), description || null, project_url || null, image_url || null, tags || null]
            );

            // Publicar projeto rende XP e pode desbloquear o badge "Portfólio Iniciado"
            gamificationHelper.awardXp(userId, 'project_added', result.insertId);

            const [created] = await db.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
            res.status(201).json(created[0]);
        } catch (error) {
            console.error('Erro em projects.create:', error);
            res.status(500).json({ error: 'Erro ao adicionar projeto' });
        }
    },

    /** Remove projeto do próprio portfólio. */
    remove: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const [rows] = await db.query('SELECT user_id FROM projects WHERE id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Projeto não encontrado.' });
            if (rows[0].user_id !== userId) {
                return res.status(403).json({ error: 'Você só pode remover seus próprios projetos.' });
            }

            await db.query('DELETE FROM projects WHERE id = ?', [id]);
            res.status(200).json({ message: 'Projeto removido.' });
        } catch (error) {
            console.error('Erro em projects.remove:', error);
            res.status(500).json({ error: 'Erro ao remover projeto' });
        }
    },
};

module.exports = projectController;
