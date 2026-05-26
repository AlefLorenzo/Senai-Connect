const jwt = require('jsonwebtoken');

const SECRET_KEY = 'senai_connect_super_secret_key'; // Em produção isso deve vir de um arquivo .env

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido.' });
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken, SECRET_KEY };
