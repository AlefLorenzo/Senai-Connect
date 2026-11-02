const db = require('./db');

async function runMigration() {
  console.log('Iniciando migração do banco de dados...');
  try {
    // ─── 1. Extensões na tabela users ───────────────────────────────────────
    console.log('Adicionando colunas na tabela users...');
    const userColumns = [
      { name: 'cover_image', definition: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'state',       definition: "VARCHAR(100) DEFAULT 'São Paulo'" },
      { name: 'city',        definition: "VARCHAR(100) DEFAULT 'São Paulo'" },
      { name: 'unit',        definition: "VARCHAR(150) DEFAULT 'Unidade Centro'" },
      { name: 'area',        definition: 'VARCHAR(150) DEFAULT NULL' },
      { name: 'course',      definition: 'VARCHAR(150) DEFAULT NULL' },
      { name: 'links',       definition: 'TEXT DEFAULT NULL' },
    ];
    for (const col of userColumns) {
      try {
        await db.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`Coluna users.${col.name} adicionada.`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Coluna users.${col.name} já existe. Ignorando.`);
        } else throw err;
      }
    }

    // ─── 2. Tabela stories ───────────────────────────────────────────────────
    console.log('Criando/verificando tabela stories...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        user_id      INT NOT NULL,
        media_url    VARCHAR(500) DEFAULT NULL,
        media_type   VARCHAR(50)  DEFAULT 'image',
        text_content TEXT         DEFAULT NULL,
        expires_at   DATETIME     DEFAULT NULL,
        created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    const storyColumns = [
      { name: 'text_content', definition: 'TEXT DEFAULT NULL' },
      { name: 'expires_at',   definition: 'DATETIME DEFAULT NULL' },
    ];
    for (const col of storyColumns) {
      try {
        await db.query(`ALTER TABLE stories ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`Coluna stories.${col.name} adicionada.`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Coluna stories.${col.name} já existe. Ignorando.`);
        } else throw err;
      }
    }
    try {
      await db.query(`ALTER TABLE stories MODIFY COLUMN media_url VARCHAR(500) DEFAULT NULL`);
    } catch (_) {}
    console.log('Tabela stories OK.');

    // ─── 3. Tabela notifications ─────────────────────────────────────────────
    console.log('Criando/verificando tabela notifications...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        type        VARCHAR(50) NOT NULL,
        sender_id   INT NOT NULL,
        content     TEXT,
        reference_id INT,
        status      VARCHAR(50) DEFAULT 'unread',
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela notifications OK.');

    // ─── 4. Tabela saved_posts (FALTAVA!) ────────────────────────────────────
    console.log('Criando/verificando tabela saved_posts...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        post_id    INT NOT NULL,
        user_id    INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela saved_posts OK.');

    // ─── 5. Coluna group_id em posts (FALTAVA!) ──────────────────────────────
    console.log('Adicionando group_id em posts...');
    try {
      await db.query(`ALTER TABLE posts ADD COLUMN group_id INT DEFAULT NULL`);
      console.log('Coluna posts.group_id adicionada.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Coluna posts.group_id já existe. Ignorando.');
      } else throw err;
    }

    // ─── 6. Colunas de mídia em messages ────────────────────────────────────
    console.log('Adicionando colunas de mídia em messages...');
    const msgColumns = [
      { name: 'message_type',    definition: "VARCHAR(20) DEFAULT 'text'" },
      { name: 'media_url',       definition: 'VARCHAR(500) DEFAULT NULL' },
      { name: 'attachment_name', definition: 'VARCHAR(255) DEFAULT NULL' },
    ];
    for (const col of msgColumns) {
      try {
        await db.query(`ALTER TABLE messages ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`Coluna messages.${col.name} adicionada.`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Coluna messages.${col.name} já existe. Ignorando.`);
        } else throw err;
      }
    }

    // ─── 7. Gamificação: XP, níveis e badges ───────────────────────────────
    console.log('Configurando gamificação (xp/level em users)...');
    const gamificationUserColumns = [
      { name: 'xp',    definition: 'INT DEFAULT 0' },
      { name: 'level', definition: 'INT DEFAULT 1' },
    ];
    for (const col of gamificationUserColumns) {
      try {
        await db.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`Coluna users.${col.name} adicionada.`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Coluna users.${col.name} já existe. Ignorando.`);
        } else throw err;
      }
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_xp_log (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        user_id      INT NOT NULL,
        action       VARCHAR(50) NOT NULL,
        points       INT NOT NULL,
        reference_id INT DEFAULT NULL,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_xp_log (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela user_xp_log OK.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        code        VARCHAR(50) UNIQUE NOT NULL,
        name        VARCHAR(100) NOT NULL,
        description VARCHAR(255) DEFAULT NULL,
        icon        VARCHAR(50) DEFAULT '🏅',
        category    VARCHAR(50) DEFAULT 'geral',
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela badges OK.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        user_id    INT NOT NULL,
        badge_id   INT NOT NULL,
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, badge_id),
        FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela user_badges OK.');

    // Catálogo de badges (idempotente via INSERT IGNORE)
    const badgeSeeds = [
      ['pioneiro',        'Pioneiro',            'Fez a primeira publicação.',                 '📝', 'conteúdo'],
      ['comunicador',     'Comunicador',         'Fez 10 comentários.',                        '💬', 'social'],
      ['influente',       'Influente',           'Recebeu 25 curtidas no total.',              '🔥', 'social'],
      ['colaborador',     'Colaborador',         'Entrou em 3 grupos.',                        '🤝', 'social'],
      ['storyteller',     'Storyteller',         'Publicou 5 histórias.',                      '📸', 'conteúdo'],
      ['destaque',        'Destaque',            'Alcançou o nível 5.',                        '⭐', 'progresso'],
      ['veterano',        'Veterano',            'Alcançou o nível 10.',                       '🏆', 'progresso'],
      ['skill_validada',  'Talento Certificado', 'Recebeu validação de um professor.',         '🎓', 'skills'],
      ['multi_talentos',  'Multi-talentos',      'Adicionou 5 habilidades ao perfil.',         '🧩', 'skills'],
      ['portfolio_start', 'Portfólio Iniciado',  'Publicou o primeiro projeto no portfólio.',  '💼', 'portfólio'],
    ];
    for (const [code, name, description, icon, category] of badgeSeeds) {
      await db.query(
        'INSERT IGNORE INTO badges (code, name, description, icon, category) VALUES (?, ?, ?, ?, ?)',
        [code, name, description, icon, category]
      );
    }
    console.log('Catálogo de badges OK.');

    // ─── 8. Skills validadas + Portfólio ───────────────────────────────────
    console.log('Criando/verificando tabelas de skills e portfólio...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(100) UNIQUE NOT NULL,
        category   VARCHAR(100) DEFAULT 'Geral',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela skills OK.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        skill_id    INT NOT NULL,
        proficiency VARCHAR(20) DEFAULT 'iniciante', -- iniciante, intermediario, avancado
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_skill (user_id, skill_id),
        FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela user_skills OK.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS skill_endorsements (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        user_skill_id INT NOT NULL,
        endorser_id   INT NOT NULL,
        endorser_role VARCHAR(50) DEFAULT 'Aluno',
        comment       VARCHAR(255) DEFAULT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_endorsement (user_skill_id, endorser_id),
        FOREIGN KEY (user_skill_id) REFERENCES user_skills(id) ON DELETE CASCADE,
        FOREIGN KEY (endorser_id)   REFERENCES users(id)       ON DELETE CASCADE
      )
    `);
    console.log('Tabela skill_endorsements OK.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        title       VARCHAR(150) NOT NULL,
        description TEXT,
        project_url VARCHAR(500) DEFAULT NULL,
        image_url   VARCHAR(500) DEFAULT NULL,
        tags        VARCHAR(255) DEFAULT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela projects OK.');

    // Catálogo inicial de skills (idempotente)
    const skillSeeds = [
      ['Programação', 'Tecnologia'], ['Banco de Dados', 'Tecnologia'], ['Redes de Computadores', 'Tecnologia'],
      ['Internet das Coisas (IoT)', 'Tecnologia'], ['Design Gráfico', 'Criativo'], ['Marketing Digital', 'Gestão'],
      ['Eletrônica', 'Industrial'], ['Eletricidade', 'Industrial'], ['Mecânica', 'Industrial'],
      ['Automação Industrial', 'Industrial'], ['Robótica', 'Industrial'], ['Mecatrônica', 'Industrial'],
      ['Soldagem', 'Industrial'], ['Manufatura Aditiva', 'Industrial'], ['Segurança do Trabalho', 'Industrial'],
      ['Logística', 'Gestão'], ['Administração', 'Gestão'], ['Qualidade', 'Gestão'],
      ['Excel e Planilhas', 'Tecnologia'], ['Idiomas', 'Geral'],
    ];
    for (const [name, category] of skillSeeds) {
      await db.query('INSERT IGNORE INTO skills (name, category) VALUES (?, ?)', [name, category]);
    }
    console.log('Catálogo de skills OK.');

    // ─── 9. Acessibilidade ─────────────────────────────────────────────────
    console.log('Adicionando preferências de acessibilidade em users...');
    try {
      await db.query(`ALTER TABLE users ADD COLUMN accessibility_prefs TEXT DEFAULT NULL`);
      console.log('Coluna users.accessibility_prefs adicionada.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Coluna users.accessibility_prefs já existe. Ignorando.');
      } else throw err;
    }

    console.log('\n✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao rodar migração:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();
