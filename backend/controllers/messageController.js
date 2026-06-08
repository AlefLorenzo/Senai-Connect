const db = require('../db');

const messageController = {
    getContacts: async (req, res) => {
        try {
            const loggedUserId = req.user.id;
            const query = `
                SELECT u.id, u.name, u.avatar, u.role,
                (SELECT m.content FROM messages m 
                 WHERE (m.sender_id = u.id AND m.receiver_id = ?) 
                    OR (m.sender_id = ? AND m.receiver_id = u.id) 
                 ORDER BY m.created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages m 
                 WHERE m.sender_id = u.id AND m.receiver_id = ? AND m.status = 'enviada') as unread_count
                FROM users u
                WHERE u.id != ?
                ORDER BY (
                    SELECT MAX(m2.created_at) FROM messages m2 
                    WHERE (m2.sender_id = u.id AND m2.receiver_id = ?) 
                       OR (m2.sender_id = ? AND m2.receiver_id = u.id)
                ) DESC, u.name ASC
            `;
            const [contacts] = await db.query(query, [
                loggedUserId, loggedUserId, loggedUserId, loggedUserId, loggedUserId, loggedUserId
            ]);
            res.status(200).json(contacts);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar contatos' });
        }
    },

    getHistory: async (req, res) => {
        try {
            const loggedUserId = req.user.id;
            const { userId } = req.params; // ID do contato com quem está conversando

            // Busca histórico
            const query = `
                SELECT * FROM messages 
                WHERE (sender_id = ? AND receiver_id = ?) 
                   OR (sender_id = ? AND receiver_id = ?) 
                ORDER BY created_at ASC
            `;
            const [messages] = await db.query(query, [loggedUserId, userId, userId, loggedUserId]);

            // Marca mensagens enviadas pelo outro usuário como lidas
            const [updateResult] = await db.query(
                "UPDATE messages SET status = 'lida' WHERE sender_id = ? AND receiver_id = ? AND status = 'enviada'",
                [userId, loggedUserId]
            );

            if (updateResult.affectedRows > 0) {
                const socketHelper = require('../socketHelper');
                socketHelper.sendToUser(userId, 'messages_read', { byUserId: loggedUserId });
            }

            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar histórico de mensagens' });
        }
    },

    send: async (req, res) => {
        try {
            const senderId = req.user.id;
            const { receiverId, content, message_type, media_url, attachment_name } = req.body;

            if (!receiverId || (!content && !media_url)) {
                return res.status(400).json({ error: 'Destinatário e conteúdo (ou mídia) são obrigatórios.' });
            }

            const [result] = await db.query(
                "INSERT INTO messages (sender_id, receiver_id, content, status, message_type, media_url, attachment_name) VALUES (?, ?, ?, 'enviada', ?, ?, ?)",
                [senderId, receiverId, content || '', message_type || 'text', media_url || null, attachment_name || null]
            );

            const [newMessage] = await db.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);

            const socketHelper = require('../socketHelper');
            socketHelper.sendToUser(receiverId, 'new_message', newMessage[0]);

            res.status(201).json(newMessage[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao enviar mensagem' });
        }
    }
};

module.exports = messageController;
