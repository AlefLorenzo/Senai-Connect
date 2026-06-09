import React, { useState } from 'react';
import './EventosPage.css';

const eventos = [
  {
    id: 1,
    titulo: 'Hackathon SENAI 2025',
    descricao:
      'Maratona de inovação com foco em soluções sustentáveis para a indústria 4.0. Equipes de até 5 pessoas competem por prêmios e reconhecimento.',
    data: '2025-07-15',
    hora: '08:00',
    local: 'Auditório Principal – SENAI São Paulo',
    categoria: 'Competição',
    vagas: 120,
    vagasRestantes: 34,
    imagem: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
    organizador: 'Equipe SENAI Digital',
    tags: ['Tecnologia', 'Inovação', 'Prêmios'],
  },
  {
    id: 2,
    titulo: 'Semana da Indústria 4.0',
    descricao:
      'Palestras, workshops e demonstrações ao vivo de automação, robótica, IoT e inteligência artificial aplicados ao setor industrial.',
    data: '2025-08-05',
    hora: '09:00',
    local: 'Pavilhão B – SENAI Campinas',
    categoria: 'Palestra',
    vagas: 300,
    vagasRestantes: 155,
    imagem: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    organizador: 'Diretoria de Inovação',
    tags: ['Indústria 4.0', 'IoT', 'Robótica'],
  },
  {
    id: 3,
    titulo: 'Workshop: Design UX/UI',
    descricao:
      'Aprenda na prática as principais metodologias de design centrado no usuário. Ferramentas como Figma e Adobe XD serão utilizadas.',
    data: '2025-07-28',
    hora: '14:00',
    local: 'Lab. de Informática 3 – SENAI São Paulo',
    categoria: 'Workshop',
    vagas: 30,
    vagasRestantes: 8,
    imagem: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    organizador: 'Prof. Carla Mendes',
    tags: ['Design', 'UX', 'Figma'],
  },
  {
    id: 4,
    titulo: 'Feira de Profissões SENAI',
    descricao:
      'Conheça as áreas de atuação disponíveis, converse com profissionais do mercado e descubra qual curso combina com o seu perfil.',
    data: '2025-09-10',
    hora: '10:00',
    local: 'Campus SENAI Santo André',
    categoria: 'Feira',
    vagas: 500,
    vagasRestantes: 320,
    imagem: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80',
    organizador: 'Coordenadoria Geral',
    tags: ['Carreiras', 'Mercado', 'Networking'],
  },
];

const categoriaColors = {
  Competição: '#ef4444',
  Palestra: '#3b82f6',
  Workshop: '#8b5cf6',
  Feira: '#f59e0b',
};

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return { day: d, month: months[parseInt(m) - 1], year: y };
}

export default function EventosPage() {
  const [inscrito, setInscrito] = useState({});
  const [modal, setModal] = useState(null);
  const [filtro, setFiltro] = useState('Todos');

  const categorias = ['Todos', ...new Set(eventos.map((e) => e.categoria))];
  const filtrados = filtro === 'Todos' ? eventos : eventos.filter((e) => e.categoria === filtro);

  const handleInscricao = (id) => {
    setInscrito((prev) => ({ ...prev, [id]: !prev[id] }));
    if (modal?.id === id) setModal(null);
  };

  return (
    <div className="eventos-page">
      {/* Hero */}
      <div className="eventos-hero">
        <div className="eventos-hero-content">
          <span className="eventos-badge">📅 Agenda SENAI</span>
          <h1>Eventos & Atividades</h1>
          <p>Participe de hackathons, workshops, palestras e muito mais. Expanda seu conhecimento e rede de contatos.</p>
        </div>
        <div className="eventos-stats">
          <div className="stat-item"><strong>{eventos.length}</strong><span>Eventos</span></div>
          <div className="stat-item"><strong>{eventos.reduce((acc, e) => acc + (e.vagas - e.vagasRestantes), 0)}</strong><span>Inscritos</span></div>
          <div className="stat-item"><strong>{Object.keys(inscrito).length}</strong><span>Suas Inscrições</span></div>
        </div>
      </div>

      {/* Filtros */}
      <div className="eventos-filtros">
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`filtro-btn ${filtro === cat ? 'active' : ''}`}
            onClick={() => setFiltro(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="eventos-grid">
        {filtrados.map((evento) => {
          const { day, month } = formatDate(evento.data);
          const ocupacao = Math.round(((evento.vagas - evento.vagasRestantes) / evento.vagas) * 100);
          const estaInscrito = inscrito[evento.id];

          return (
            <div key={evento.id} className="evento-card" onClick={() => setModal(evento)}>
              <div className="evento-img-wrapper">
                <img src={evento.imagem} alt={evento.titulo} />
                <span
                  className="evento-categoria"
                  style={{ background: categoriaColors[evento.categoria] }}
                >
                  {evento.categoria}
                </span>
                {estaInscrito && <span className="evento-inscrito-badge">✓ Inscrito</span>}
              </div>

              <div className="evento-body">
                <div className="evento-date-block">
                  <span className="ev-day">{day}</span>
                  <span className="ev-month">{month}</span>
                </div>
                <div className="evento-info">
                  <h3>{evento.titulo}</h3>
                  <p className="evento-local">📍 {evento.local}</p>
                  <p className="evento-hora">🕐 {evento.hora}h</p>
                  <div className="evento-tags">
                    {evento.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <div className="evento-vagas">
                    <div className="vagas-bar">
                      <div className="vagas-fill" style={{ width: `${ocupacao}%` }} />
                    </div>
                    <span>{evento.vagasRestantes} vagas restantes</span>
                  </div>
                </div>
              </div>

              <button
                className={`evento-btn ${estaInscrito ? 'cancelar' : 'inscrever'}`}
                onClick={(e) => { e.stopPropagation(); handleInscricao(evento.id); }}
              >
                {estaInscrito ? 'Cancelar Inscrição' : 'Inscrever-se'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="eventos-modal-overlay" onClick={() => setModal(null)}>
          <div className="eventos-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <img src={modal.imagem} alt={modal.titulo} className="modal-img" />
            <div className="modal-body">
              <span
                className="evento-categoria"
                style={{ background: categoriaColors[modal.categoria], position: 'static', marginBottom: 12 }}
              >
                {modal.categoria}
              </span>
              <h2>{modal.titulo}</h2>
              <p className="modal-desc">{modal.descricao}</p>
              <div className="modal-details">
                <div><strong>📅 Data:</strong> {modal.data.split('-').reverse().join('/')} às {modal.hora}h</div>
                <div><strong>📍 Local:</strong> {modal.local}</div>
                <div><strong>👤 Organizador:</strong> {modal.organizador}</div>
                <div><strong>🎟 Vagas:</strong> {modal.vagasRestantes} de {modal.vagas} disponíveis</div>
              </div>
              <div className="evento-tags" style={{ marginTop: 16 }}>
                {modal.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
              <button
                className={`evento-btn ${inscrito[modal.id] ? 'cancelar' : 'inscrever'}`}
                style={{ width: '100%', marginTop: 24 }}
                onClick={() => handleInscricao(modal.id)}
              >
                {inscrito[modal.id] ? 'Cancelar Inscrição' : 'Confirmar Inscrição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
