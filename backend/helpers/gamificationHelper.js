const db = require('../db');
const socketHelper = require('../socketHelper');

/**
 * Gamificação do SENAI Connect
 * ---------------------------
 * XP é concedido por ações que agregam valor à comunidade.
 * Níveis seguem uma curva quadrática: o nível N começa em 50 * N * (N-1) XP.
 *   Nível 2 → 100 XP | Nível 3 → 300 XP | Nível 4 → 600 XP | Nível 5 → 1.000 XP
 * Badges são avaliados automaticamente a cada concessão de XP.
 */

const XP_RULES = {
  post_created:      10, // criou um post
  comment_created:    5, // comentou em um post
  like_received:      2, // recebeu curtida (dono do post)
  group_joined:       5, // entrou em um grupo
  group_created:     10, // criou um grupo
  story_created:      5, // publicou uma história
  skill_endorsed:    15, // teve skill validada por alguém
  endorsement_given:  3, // validou a skill de outra pessoa
  project_added:     20, // adicionou projeto ao portfólio
};

const XP_ACTION_LABELS = {
  post_created:      'Publicação criada',
  comment_created:   'Comentário publicado',
  like_received:     'Curtida recebida',
  group_joined:      'Entrou em um grupo',
  group_created:     'Grupo criado',
  story_created:     'História publicada',
  skill_endorsed:    'Habilidade validada',
  endorsement_given: 'Você validou uma habilidade',
  project_added:     'Projeto adicionado ao portfólio',
};

/** XP acumulado necessário para ENTRAR no nível informado. */
function xpForLevel(level) {
  return 50 * level * (level - 1);
}

/** Nível correspondente a um total de XP acumulado. */
function levelForXp(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

/**
 * Concede XP a um usuário, recalcula nível, avalia badges e
 * emite eventos em tempo real (xp_gained / level_up / badge_unlocked).
 * Nunca lança exceção para não quebrar o fluxo principal da ação.
 */
async function awardXp(userId, action, referenceId = null) {
  try {
    const points = XP_RULES[action];
    if (!points || !userId) return;

    await db.query(
      'INSERT INTO user_xp_log (user_id, action, points, reference_id) VALUES (?, ?, ?, ?)',
      [userId, action, points, referenceId]
    );

    await db.query('UPDATE users SET xp = xp + ? WHERE id = ?', [points, userId]);

    const [rows] = await db.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return;

    const totalXp = rows[0].xp;
    const previousLevel = rows[0].level;
    const newLevel = levelForXp(totalXp);

    if (newLevel > previousLevel) {
      await db.query('UPDATE users SET level = ? WHERE id = ?', [newLevel, userId]);
      socketHelper.sendToUser(userId, 'level_up', { level: newLevel, xp: totalXp });
      try {
        const notificationController = require('../controllers/notificationController');
        await notificationController.createNotification(
          userId, 'level_up', userId, null, `subiu para o nível ${newLevel}! 🎉`
        );
      } catch (_) { /* notificação não-bloqueante */ }
    }

    socketHelper.sendToUser(userId, 'xp_gained', {
      points,
      action,
      label: XP_ACTION_LABELS[action] || action,
      xp: totalXp,
      level: newLevel,
    });

    await checkBadges(userId);
  } catch (error) {
    console.error(`Erro ao conceder XP (${action}) para usuário ${userId}:`, error);
  }
}

/** Estatísticas usadas nas regras de badges. */
async function getUserStats(userId) {
  const [
    [posts],
    [comments],
    [likes],
    [groups],
    [stories],
    [skills],
    [projects],
    [teacherEndorsements],
    [userRows],
  ] = await Promise.all([
    db.query('SELECT COUNT(*) AS c FROM posts WHERE user_id = ?', [userId]),
    db.query('SELECT COUNT(*) AS c FROM comments WHERE user_id = ?', [userId]),
    db.query('SELECT COUNT(*) AS c FROM post_likes pl JOIN posts p ON pl.post_id = p.id WHERE p.user_id = ?', [userId]),
    db.query('SELECT COUNT(*) AS c FROM group_members WHERE user_id = ?', [userId]),
    db.query('SELECT COUNT(*) AS c FROM stories WHERE user_id = ?', [userId]),
    db.query('SELECT COUNT(*) AS c FROM user_skills WHERE user_id = ?', [userId]),
    db.query('SELECT COUNT(*) AS c FROM projects WHERE user_id = ?', [userId]),
    db.query(
      `SELECT COUNT(*) AS c FROM skill_endorsements se
       JOIN user_skills us ON se.user_skill_id = us.id
       WHERE us.user_id = ? AND se.endorser_role = 'Professor'`, [userId]
    ),
    db.query('SELECT level FROM users WHERE id = ?', [userId]),
  ]);

  return {
    posts: posts[0].c,
    comments: comments[0].c,
    likesReceived: likes[0].c,
    groups: groups[0].c,
    stories: stories[0].c,
    skills: skills[0].c,
    projects: projects[0].c,
    teacherEndorsements: teacherEndorsements[0].c,
    level: userRows[0] ? userRows[0].level : 1,
  };
}

const BADGE_RULES = [
  { code: 'pioneiro',        test: (s) => s.posts >= 1 },
  { code: 'comunicador',     test: (s) => s.comments >= 10 },
  { code: 'influente',       test: (s) => s.likesReceived >= 25 },
  { code: 'colaborador',     test: (s) => s.groups >= 3 },
  { code: 'storyteller',     test: (s) => s.stories >= 5 },
  { code: 'destaque',        test: (s) => s.level >= 5 },
  { code: 'veterano',        test: (s) => s.level >= 10 },
  { code: 'skill_validada',  test: (s) => s.teacherEndorsements >= 1 },
  { code: 'multi_talentos',  test: (s) => s.skills >= 5 },
  { code: 'portfolio_start', test: (s) => s.projects >= 1 },
];

/** Avalia e concede badges pendentes do usuário. */
async function checkBadges(userId) {
  try {
    const [earned] = await db.query(
      'SELECT b.code FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = ?',
      [userId]
    );
    const earnedCodes = new Set(earned.map((r) => r.code));

    const pending = BADGE_RULES.filter((r) => !earnedCodes.has(r.code));
    if (pending.length === 0) return;

    const stats = await getUserStats(userId);

    for (const rule of pending) {
      if (!rule.test(stats)) continue;

      const [badgeRows] = await db.query('SELECT * FROM badges WHERE code = ?', [rule.code]);
      if (badgeRows.length === 0) continue;
      const badge = badgeRows[0];

      const [result] = await db.query(
        'INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badge.id]
      );

      if (result.affectedRows > 0) {
        socketHelper.sendToUser(userId, 'badge_unlocked', {
          code: badge.code,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
        });
        try {
          const notificationController = require('../controllers/notificationController');
          await notificationController.createNotification(
            userId, 'badge', userId, badge.id, `conquistou a medalha "${badge.name}" ${badge.icon}`
          );
        } catch (_) { /* notificação não-bloqueante */ }
      }
    }
  } catch (error) {
    console.error(`Erro ao avaliar badges do usuário ${userId}:`, error);
  }
}

module.exports = {
  XP_RULES,
  XP_ACTION_LABELS,
  xpForLevel,
  levelForXp,
  awardXp,
  checkBadges,
};
