const db = require('../db');
const { xpForLevel, XP_ACTION_LABELS } = require('../helpers/gamificationHelper');

/** Monta o pacote de progresso (nível, XP, barra, badges) de um usuário. */
async function buildProgress(userId, includeLog) {
  const [users] = await db.query('SELECT id, name, avatar, role, xp, level FROM users WHERE id = ?', [userId]);
  if (users.length === 0) return null;

  const user = users[0];
  const currentLevelXp = xpForLevel(user.level);
  const nextLevelXp = xpForLevel(user.level + 1);
  const span = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(100, Math.round(((user.xp - currentLevelXp) / span) * 100));

  const [allBadges] = await db.query(`
    SELECT b.*, ub.awarded_at,
           (ub.user_id IS NOT NULL) AS earned
    FROM badges b
    LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = ?
    ORDER BY earned DESC, ub.awarded_at DESC, b.id ASC
  `, [userId]);

  const progress = {
    user: { id: user.id, name: user.name, avatar: user.avatar, role: user.role },
    xp: user.xp,
    level: user.level,
    currentLevelXp,
    nextLevelXp,
    xpToNextLevel: Math.max(0, nextLevelXp - user.xp),
    progressPercent,
    badges: allBadges,
    earnedCount: allBadges.filter((b) => b.earned).length,
  };

  if (includeLog) {
    const [log] = await db.query(
      'SELECT action, points, created_at FROM user_xp_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 15',
      [userId]
    );
    progress.recentXp = log.map((entry) => ({
      ...entry,
      label: XP_ACTION_LABELS[entry.action] || entry.action,
    }));
  }

  return progress;
}

const gamificationController = {
    /** Progresso completo do usuário logado (inclui histórico de XP). */
    getMyProgress: async (req, res) => {
        try {
            const progress = await buildProgress(req.user.id, true);
            if (!progress) return res.status(404).json({ error: 'Usuário não encontrado.' });
            res.status(200).json(progress);
        } catch (error) {
            console.error('Erro em getMyProgress:', error);
            res.status(500).json({ error: 'Erro ao buscar progresso' });
        }
    },

    /** Progresso público de qualquer usuário (para o perfil de terceiros). */
    getUserProgress: async (req, res) => {
        try {
            const progress = await buildProgress(req.params.userId, false);
            if (!progress) return res.status(404).json({ error: 'Usuário não encontrado.' });
            res.status(200).json(progress);
        } catch (error) {
            console.error('Erro em getUserProgress:', error);
            res.status(500).json({ error: 'Erro ao buscar progresso' });
        }
    },

    /** Ranking geral por XP. */
    getLeaderboard: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT u.id, u.name, u.avatar, u.role, u.area, u.unit, u.xp, u.level,
                       (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = u.id) AS badges_count
                FROM users u
                ORDER BY u.xp DESC, u.created_at ASC
                LIMIT 50
            `);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Erro em getLeaderboard:', error);
            res.status(500).json({ error: 'Erro ao buscar ranking' });
        }
    },
};

module.exports = gamificationController;
