const express = require('express');
const cors = require('cors');
const http = require('http');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const messageRoutes = require('./routes/messageRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const storyRoutes = require('./routes/storyRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const skillRoutes = require('./routes/skillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const path = require('path');

const socketHelper = require('./socketHelper');

const app = express();
const server = http.createServer(app);

// Inicializa o Socket.io
socketHelper.init(server);

// CORS rigoroso conforme exigido
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de fallback
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API SENAI Connect Rodando (MVC) na porta 5000!' });
});

const PORT = 5000; // Alterado para 5000 pois a 3000 pode estar ocupada
server.listen(PORT, () => {
    console.log(`Servidor MVC rodando na porta ${PORT}`);
});
