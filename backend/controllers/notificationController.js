const db = require('../db');
const socketHelper = require('../socketHelper');

const notificationController = {
    getNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const [notifications] = await db.query(
                `SELECT n.*, u.name as source_user_name, u.avatar as source_user_avatar
                 FROM notifications n
                 LEFT JOIN users u ON n.sender_id = u.id
                 WHERE n.user_id = ? ORDER BY n.created_at DESC`,
                [userId]
            );
            // Map DB columns to frontend-expected format
            const mapped = notifications.map(n => ({
                ...n,
                source_user_id: n.sender_id,
                post_id: n.reference_id,
                read: n.status === 'read'
            }));
            res.status(200).json(mapped);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            res.status(500).json({ error: 'Erro ao buscar notificações.' });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await db.query("UPDATE notifications SET status = 'read' WHERE id = ? AND user_id = ?", [id, userId]);
            res.status(200).json({ message: 'Notificação marcada como lida.' });
        } catch (error) {
            console.error('Erro ao atualizar notificação:', error);
            res.status(500).json({ error: 'Erro ao atualizar notificação.' });
        }
    },

    createNotification: async (userId, type, sourceUserId, postId, content) => {
        try {
            if (userId === sourceUserId) return; // Don't notify yourself

            const [result] = await db.query(
                'INSERT INTO notifications (user_id, type, sender_id, content, reference_id) VALUES (?, ?, ?, ?, ?)',
                [userId, type, sourceUserId, content, postId]
            );

            // Fetch notification details to emit
            const [notifications] = await db.query(
                `SELECT n.*, u.name as source_user_name, u.avatar as source_user_avatar
                 FROM notifications n
                 LEFT JOIN users u ON n.sender_id = u.id
                 WHERE n.id = ?`,
                [result.insertId]
            );

            if (notifications.length > 0) {
                const n = notifications[0];
                socketHelper.sendToUser(userId, 'new_notification', {
                    ...n,
                    source_user_id: n.sender_id,
                    post_id: n.reference_id,
                    read: false
                });
            }
        } catch (error) {
            console.error('Erro ao criar notificação:', error);
        }
    }
};

module.exports = notificationController;
