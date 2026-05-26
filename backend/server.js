const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const messageRoutes = require('./routes/messageRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

const app = express();

// CORS rigoroso conforme exigido
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notices', noticeRoutes);

// Rota de fallback
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API SENAI Connect Rodando (MVC) na porta 5000!' });
});

const PORT = 5000; // Alterado para 5000 pois a 3000 pode estar ocupada
app.listen(PORT, () => {
    console.log(`Servidor MVC rodando na porta ${PORT}`);
});
