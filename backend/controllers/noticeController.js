const db = require('../db');

const noticeController = {
    getNotices: async (req, res) => {
        try {
            const query = `
                SELECT n.*, u.name as author_name, u.avatar as author_avatar
                FROM notices n
                JOIN users u ON n.author_id = u.id
                ORDER BY n.created_at DESC
            `;
            const [notices] = await db.query(query);
            res.status(200).json(notices);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar avisos' });
        }
    },

    createNotice: async (req, res) => {
        try {
            const { title, content } = req.body;
            const authorId = req.user.id;

            if (!title) return res.status(400).json({ error: 'Título é obrigatório.' });

            const [result] = await db.query(
                'INSERT INTO notices (author_id, title, content) VALUES (?, ?, ?)',
                [authorId, title, content || '']
            );

            res.status(201).json({ id: result.insertId, message: 'Aviso criado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar aviso' });
        }
    },

    getEvents: async (req, res) => {
        try {
            const query = `
                SELECT e.*, u.name as author_name
                FROM events e
                JOIN users u ON e.author_id = u.id
                ORDER BY e.event_date ASC
            `;
            const [events] = await db.query(query);
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar eventos' });
        }
    },

    createEvent: async (req, res) => {
        try {
            const { title, description, event_date, location } = req.body;
            const authorId = req.user.id;

            if (!title || !event_date) return res.status(400).json({ error: 'Título e data do evento são obrigatórios.' });

            const [result] = await db.query(
                'INSERT INTO events (author_id, title, description, event_date, location) VALUES (?, ?, ?, ?, ?)',
                [authorId, title, description || '', event_date, location || '']
            );

            res.status(201).json({ id: result.insertId, message: 'Evento criado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar evento' });
        }
    }
};

module.exports = noticeController;
