const db = require('../db');
const gamificationHelper = require('../helpers/gamificationHelper');

const PROFICIENCIES = ['iniciante', 'intermediario', 'avancado'];

const skillController = {
    /** Catálogo de skills (com busca opcional ?q=). */
    catalog: async (req, res) => {
        try {
            const { q } = req.query;
            let query = 'SELECT * FROM skills';
            const params = [];
            if (q) {
                query += ' WHERE name LIKE ?';
                params.push(`%${q}%`);
            }
            query += ' ORDER BY category ASC, name ASC LIMIT 30';
            const [skills] = await db.query(query, params);
            res.status(200).json(skills);
        } catch (error) {
            console.error('Erro em skills.catalog:', error);
            res.status(500).json({ error: 'Erro ao buscar catálogo de habilidades' });
        }
    },

    /** Skills de um usuário com contadores de validação (professor x colegas). */
    getUserSkills: async (req, res) => {
        try {
            const { userId } = req.params;
            const viewerId = req.user.id;

            const [skills] = await db.query(`
                SELECT us.id AS user_skill_id, us.proficiency, us.created_at,
                       s.id AS skill_id, s.name, s.category,
                       (SELECT COUNT(*) FROM skill_endorsements se WHERE se.user_skill_id = us.id) AS endorsements_count,
                       (SELECT COUNT(*) FROM skill_endorsements se WHERE se.user_skill_id = us.id AND se.endorser_role = 'Professor') AS teacher_count,
                       EXISTS(SELECT 1 FROM skill_endorsements se WHERE se.user_skill_id = us.id AND se.endorser_id = ?) AS endorsed_by_me
                FROM user_skills us
                JOIN skills s ON us.skill_id = s.id
                WHERE us.user_id = ?
                ORDER BY teacher_count DESC, endorsements_count DESC, us.created_at DESC
            `, [viewerId, userId]);

            // Últimas validações (nome/avatar) para exibir no chip
            for (const skill of skills) {
                const [endorsers] = await db.query(`
                    SELECT u.id, u.name, u.avatar, se.endorser_role
                    FROM skill_endorsements se
                    JOIN users u ON se.endorser_id = u.id
                    WHERE se.user_skill_id = ?
                    ORDER BY (se.endorser_role = 'Professor') DESC, se.created_at DESC
                    LIMIT 4
                `, [skill.user_skill_id]);
                skill.endorsers = endorsers;
            }

            res.status(200).json(skills);
        } catch (error) {
            console.error('Erro em skills.getUserSkills:', error);
            res.status(500).json({ error: 'Erro ao buscar habilidades' });
        }
    },

    /** Adiciona uma skill ao próprio perfil (por skill_id ou nome livre). */
    add: async (req, res) => {
        try {
            const { skill_id, name, proficiency } = req.body;
            const userId = req.user.id;

            const level = PROFICIENCIES.includes(proficiency) ? proficiency : 'iniciante';

            let skillId = skill_id;
            if (!skillId) {
                if (!name || !name.trim()) {
                    return res.status(400).json({ error: 'Informe a habilidade.' });
                }
                const cleanName = name.trim().slice(0, 100);
                // Reutiliza skill existente (case-insensitive) ou cria nova no catálogo
                const [existing] = await db.query('SELECT id FROM skills WHERE LOWER(name) = LOWER(?)', [cleanName]);
                if (existing.length > 0) {
                    skillId = existing[0].id;
                } else {
                    const [created] = await db.query(
                        "INSERT INTO skills (name, category) VALUES (?, 'Geral')",
                        [cleanName]
                    );
                    skillId = created.insertId;
                }
            }

            const [duplicate] = await db.query(
                'SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ?',
                [userId, skillId]
            );
            if (duplicate.length > 0) {
                return res.status(400).json({ error: 'Você já adicionou esta habilidade.' });
            }

            const [result] = await db.query(
                'INSERT INTO user_skills (user_id, skill_id, proficiency) VALUES (?, ?, ?)',
                [userId, skillId, level]
            );

            gamificationHelper.checkBadges(userId);

            res.status(201).json({ id: result.insertId, message: 'Habilidade adicionada!' });
        } catch (error) {
            console.error('Erro em skills.add:', error);
            res.status(500).json({ error: 'Erro ao adicionar habilidade' });
        }
    },

    /** Remove uma skill do próprio perfil. */
    remove: async (req, res) => {
        try {
            const { userSkillId } = req.params;
            const userId = req.user.id;

            const [rows] = await db.query('SELECT user_id FROM user_skills WHERE id = ?', [userSkillId]);
            if (rows.length === 0) return res.status(404).json({ error: 'Habilidade não encontrada.' });
            if (rows[0].user_id !== userId) {
                return res.status(403).json({ error: 'Você só pode remover suas próprias habilidades.' });
            }

            await db.query('DELETE FROM user_skills WHERE id = ?', [userSkillId]);
            res.status(200).json({ message: 'Habilidade removida.' });
        } catch (error) {
            console.error('Erro em skills.remove:', error);
            res.status(500).json({ error: 'Erro ao remover habilidade' });
        }
    },

    /** Valida (endossa) a skill de outro usuário. Professor pesa mais. */
    endorse: async (req, res) => {
        try {
            const { userSkillId } = req.params;
            const endorserId = req.user.id;
            const endorserRole = req.user.role || 'Aluno';

            const [rows] = await db.query(`
                SELECT us.user_id, s.name AS skill_name
                FROM user_skills us
                JOIN skills s ON us.skill_id = s.id
                WHERE us.id = ?
            `, [userSkillId]);
            if (rows.length === 0) return res.status(404).json({ error: 'Habilidade não encontrada.' });

            const ownerId = rows[0].user_id;
            if (ownerId === endorserId) {
                return res.status(400).json({ error: 'Você não pode validar a própria habilidade.' });
            }

            const [existing] = await db.query(
                'SELECT id FROM skill_endorsements WHERE user_skill_id = ? AND endorser_id = ?',
                [userSkillId, endorserId]
            );
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Você já validou esta habilidade.' });
            }

            await db.query(
                'INSERT INTO skill_endorsements (user_skill_id, endorser_id, endorser_role) VALUES (?, ?, ?)',
                [userSkillId, endorserId, endorserRole]
            );

            // XP: quem recebe a validação ganha mais; validar também rende XP
            gamificationHelper.awardXp(ownerId, 'skill_endorsed', parseInt(userSkillId));
            gamificationHelper.awardXp(endorserId, 'endorsement_given', parseInt(userSkillId));

            // Notifica o dono da skill
            try {
                const notificationController = require('./notificationController');
                const quem = endorserRole === 'Professor' ? 'Um professor validou' : 'Alguém validou';
                await notificationController.createNotification(
                    ownerId, 'skill_endorsement', endorserId, parseInt(userSkillId),
                    `${quem} sua habilidade "${rows[0].skill_name}" ✅`
                );
            } catch (_) { /* notificação não-bloqueante */ }

            res.status(201).json({ message: 'Habilidade validada!', endorsed: true });
        } catch (error) {
            console.error('Erro em skills.endorse:', error);
            res.status(500).json({ error: 'Erro ao validar habilidade' });
        }
    },

    /** Remove a própria validação. */
    unendorse: async (req, res) => {
        try {
            const { userSkillId } = req.params;
            const endorserId = req.user.id;

            await db.query(
                'DELETE FROM skill_endorsements WHERE user_skill_id = ? AND endorser_id = ?',
                [userSkillId, endorserId]
            );
            res.status(200).json({ message: 'Validação removida.', endorsed: false });
        } catch (error) {
            console.error('Erro em skills.unendorse:', error);
            res.status(500).json({ error: 'Erro ao remover validação' });
        }
    },
};

module.exports = skillController;
