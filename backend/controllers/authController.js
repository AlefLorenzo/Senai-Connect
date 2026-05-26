const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { SECRET_KEY } = require('../middlewares/auth');

const authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            // Validação básica
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }

            // Verifica se usuário existe
            const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (existing.length > 0) return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });

            // Hash da senha
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Inserir no banco
            const [result] = await db.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [name, email, passwordHash, role || 'Aluno']
            );

            res.status(201).json({ message: 'Cadastro realizado com sucesso!', userId: result.insertId });
        } catch (error) {
            console.error('Erro no register:', error);
            res.status(500).json({ error: 'Erro interno do servidor ao tentar cadastrar.' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Preencha e-mail e senha.' });
            }

            // Busca usuário
            const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

            const user = users[0];

            // Verifica senha
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) return res.status(401).json({ error: 'Senha incorreta.' });

            // Gera token
            const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

            res.status(200).json({
                message: 'Login realizado com sucesso',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno do servidor ao realizar login.' });
        }
    },

    me: async (req, res) => {
        try {
            const [users] = await db.query('SELECT id, name, email, role, avatar, bio FROM users WHERE id = ?', [req.user.id]);
            if (users.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
            res.status(200).json(users[0]);
        } catch (error) {
            console.error('Erro no me:', error);
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
};

module.exports = authController;
