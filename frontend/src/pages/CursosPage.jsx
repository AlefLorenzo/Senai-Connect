import React, { useState } from 'react';
import './CursosPage.css';

const cursos = [
  {
    id: 1,
    titulo: 'Desenvolvimento Web Full Stack',
    descricao: 'Do zero ao deploy: HTML, CSS, JavaScript, React, Node.js e bancos de dados. Aprenda a criar aplicações web modernas e profissionais.',
    instrutor: 'Prof. Ricardo Alves',
    avatar: 'https://i.pravatar.cc/48?img=11',
    duracao: '120h',
    modulos: 12,
    nivel: 'Iniciante',
    categoria: 'Tecnologia',
    alunos: 847,
    avaliacao: 4.9,
    preco: 'Gratuito',
    imagem: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
    tags: ['HTML', 'CSS', 'React', 'Node.js'],
    progresso: 0,
  },
  {
    id: 2,
    titulo: 'Automação Industrial com CLP',
    descricao: 'Programação de Controladores Lógicos Programáveis (CLP) com foco na automação de processos industriais. Inclui simulações práticas.',
    instrutor: 'Prof. Marcos Fernandes',
    avatar: 'https://i.pravatar.cc/48?img=12',
    duracao: '80h',
    modulos: 8,
    nivel: 'Intermediário',
    categoria: 'Automação',
    alunos: 520,
    avaliacao: 4.7,
    preco: 'Gratuito',
    imagem: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80',
    tags: ['CLP', 'SCADA', 'Automação'],
    progresso: 0,
  },
  {
    id: 3,
    titulo: 'Design Gráfico & Identidade Visual',
    descricao: 'Princípios do design, tipografia, teoria das cores, criação de logotipos e identidade visual completa usando ferramentas profissionais.',
    instrutor: 'Profa. Fernanda Costa',
    avatar: 'https://i.pravatar.cc/48?img=5',
    duracao: '60h',
    modulos: 6,
    nivel: 'Iniciante',
    categoria: 'Design',
    alunos: 1203,
    avaliacao: 4.8,
    preco: 'Gratuito',
    imagem: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80',
    tags: ['Photoshop', 'Illustrator', 'Branding'],
    progresso: 0,
  },
  {
    id: 4,
    titulo: 'Segurança do Trabalho NR-35',
    descricao: 'Norma Regulamentadora 35 – Trabalho em Altura. Conteúdo teórico e prático para certificação e atuação segura em campo.',
    instrutor: 'Prof. Eduardo Lima',
    avatar: 'https://i.pravatar.cc/48?img=15',
    duracao: '40h',
    modulos: 5,
    nivel: 'Iniciante',
    categoria: 'Segurança',
    alunos: 2100,
    avaliacao: 4.6,
    preco: 'Gratuito',
    imagem: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    tags: ['NR-35', 'EPI', 'Altura'],
    progresso: 0,
  },
  {
    id: 5,
    titulo: 'Inteligência Artificial Aplicada',
    descricao: 'Machine learning, redes neurais e aplicações práticas de IA na indústria. Python e frameworks modernos como TensorFlow e scikit-learn.',
    instrutor: 'Prof. Ana Ribeiro',
    avatar: 'https://i.pravatar.cc/48?img=9',
    duracao: '100h',
    modulos: 10,
    nivel: 'Avançado',
    categoria: 'Tecnologia',
    alunos: 430,
    avaliacao: 4.9,
    preco: 'Gratuito',
    imagem: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    tags: ['Python', 'ML', 'TensorFlow'],
    progresso: 0,
  },
  {
    id: 6,
    titulo: 'Gestão de Projetos – Ágil & Scrum',
    descricao: 'Metodologias ágeis, Scrum, Kanban e OKRs. Gerencie equipes e projetos com eficiência e entregue valor de forma contínua.',
    instrutor: 'Prof. Bruno Souza',
    avatar: 'https://i.pravatar.cc/48?img=7',
    duracao: '50h',
    modulos: 7,
    nivel: 'Intermediário',
    categoria: 'Gestão',
    alunos: 980,
    avaliacao: 4.7,
    preco: 'Gratuito',
    imagem: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    tags: ['Scrum', 'Kanban', 'Agile'],
    progresso: 0,
  },
];

const nivelColor = { Iniciante: '#22c55e', Intermediário: '#f59e0b', Avançado: '#ef4444' };
const categoriaIcons = { Tecnologia: '💻', Automação: '⚙️', Design: '🎨', Segurança: '🦺', Gestão: '📊' };

function Stars({ rating }) {
  return (
    <span className="stars">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span className="rating-num"> {rating}</span>
    </span>
  );
}

export default function CursosPage() {
  const [inscritos, setInscritos] = useState({});
  const [progressos, setProgressos] = useState({});
  const [filtro, setFiltro] = useState('Todos');
  const [busca, setBusca] = useState('');

  const categorias = ['Todos', ...new Set(cursos.map((c) => c.categoria))];

  const filtrados = cursos.filter((c) => {
    const passaFiltro = filtro === 'Todos' || c.categoria === filtro;
    const passaBusca = c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(busca.toLowerCase()));
    return passaFiltro && passaBusca;
  });

  const handleMatricula = (id) => {
    setInscritos((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!inscritos[id]) setProgressos((prev) => ({ ...prev, [id]: 0 }));
  };

  const avancarProgresso = (e, id) => {
    e.stopPropagation();
    setProgressos((prev) => ({ ...prev, [id]: Math.min((prev[id] || 0) + 10, 100) }));
  };

  return (
    <div className="cursos-page">
      {/* Hero */}
      <div className="cursos-hero">
        <div className="cursos-hero-text">
          <span className="cursos-badge">🎓 Plataforma de Cursos</span>
          <h1>Aprenda com os Melhores</h1>
          <p>Cursos gratuitos desenvolvidos por especialistas do SENAI para alavancar sua carreira.</p>
          <div className="cursos-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar cursos ou tecnologias..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div className="cursos-hero-stats">
          <div className="c-stat"><strong>{cursos.length}</strong><span>Cursos</span></div>
          <div className="c-stat"><strong>{cursos.reduce((a, c) => a + c.alunos, 0).toLocaleString()}</strong><span>Alunos</span></div>
          <div className="c-stat"><strong>{Object.values(inscritos).filter(Boolean).length}</strong><span>Matriculados</span></div>
        </div>
      </div>

      {/* Filtros */}
      <div className="cursos-filtros">
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`filtro-btn-c ${filtro === cat ? 'active' : ''}`}
            onClick={() => setFiltro(cat)}
          >
            {categoriaIcons[cat] || '📚'} {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="cursos-grid">
        {filtrados.map((curso) => {
          const estaMatriculado = inscritos[curso.id];
          const prog = progressos[curso.id] || 0;

          return (
            <div key={curso.id} className="curso-card">
              <div className="curso-img-wrapper">
                <img src={curso.imagem} alt={curso.titulo} />
                <span className="curso-nivel" style={{ background: nivelColor[curso.nivel] }}>{curso.nivel}</span>
                <span className="curso-cat-icon">{categoriaIcons[curso.categoria]}</span>
              </div>

              <div className="curso-body">
                <h3>{curso.titulo}</h3>
                <p className="curso-desc">{curso.descricao}</p>

                <div className="curso-instrutor">
                  <img src={curso.avatar} alt={curso.instrutor} />
                  <span>{curso.instrutor}</span>
                </div>

                <div className="curso-tags">
                  {curso.tags.map((t) => <span key={t} className="tag-c">{t}</span>)}
                </div>

                <div className="curso-meta">
                  <span>⏱ {curso.duracao}</span>
                  <span>📚 {curso.modulos} módulos</span>
                  <span>👥 {curso.alunos.toLocaleString()}</span>
                </div>

                <div className="curso-avaliacao">
                  <Stars rating={curso.avaliacao} />
                </div>

                {estaMatriculado && (
                  <div className="curso-progresso">
                    <div className="progresso-bar">
                      <div className="progresso-fill" style={{ width: `${prog}%` }} />
                    </div>
                    <div className="progresso-info">
                      <span>{prog}% concluído</span>
                      {prog < 100 && (
                        <button className="continuar-btn" onClick={(e) => avancarProgresso(e, curso.id)}>
                          Continuar ▶
                        </button>
                      )}
                      {prog === 100 && <span className="concluido-badge">🏆 Concluído!</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="curso-footer">
                <span className="curso-preco">{curso.preco}</span>
                <button
                  className={`matricula-btn ${estaMatriculado ? 'cancelar' : ''}`}
                  onClick={() => handleMatricula(curso.id)}
                >
                  {estaMatriculado ? 'Cancelar Matrícula' : 'Matricular-se'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
