import React, { useState } from 'react';
import './AvisosPage.css';

const prioridades = {
  urgente: { label: 'Urgente', color: '#ef4444', icon: '🚨' },
  importante: { label: 'Importante', color: '#f59e0b', icon: '⚠️' },
  informativo: { label: 'Informativo', color: '#3b82f6', icon: 'ℹ️' },
  geral: { label: 'Geral', color: '#6b7280', icon: '📢' },
};

const avisos = [
  {
    id: 1,
    titulo: 'Manutenção dos Servidores – 14/07',
    conteudo:
      'Informamos que haverá manutenção programada nos servidores da plataforma no dia 14 de julho de 2025, das 22h às 02h. Durante esse período, o sistema ficará temporariamente indisponível. Recomendamos salvar todos os trabalhos antes do horário indicado.',
    prioridade: 'urgente',
    setor: 'T.I.',
    autor: 'Equipe de Infraestrutura',
    avatar: 'https://i.pravatar.cc/40?img=3',
    data: '2025-07-10',
    lidos: 342,
    total: 500,
    fixado: true,
    categoria: 'Sistema',
  },
  {
    id: 2,
    titulo: 'Prazo Final – Entrega do Projeto Integrador',
    conteudo:
      'Lembramos a todos os alunos do 3º semestre que o prazo final para entrega do Projeto Integrador é dia 20 de julho de 2025. Os trabalhos devem ser enviados pela plataforma até as 23h59. Não serão aceitas entregas após esse horário. Em caso de dúvidas, entre em contato com seu orientador.',
    prioridade: 'importante',
    setor: 'Acadêmico',
    autor: 'Coordenadoria Pedagógica',
    avatar: 'https://i.pravatar.cc/40?img=20',
    data: '2025-07-08',
    lidos: 280,
    total: 300,
    fixado: true,
    categoria: 'Acadêmico',
  },
  {
    id: 3,
    titulo: 'Nova Biblioteca Digital Disponível',
    conteudo:
      'Temos o prazer de anunciar que a Biblioteca Digital SENAI foi atualizada com mais de 500 novos títulos nas áreas de tecnologia, gestão, engenharia e design. O acesso é gratuito para todos os alunos e professores matriculados. Acesse pelo menu "Arquivos" da plataforma.',
    prioridade: 'informativo',
    setor: 'Biblioteca',
    autor: 'Gestão de Conteúdo',
    avatar: 'https://i.pravatar.cc/40?img=8',
    data: '2025-07-06',
    lidos: 190,
    total: 500,
    fixado: false,
    categoria: 'Recursos',
  },
  {
    id: 4,
    titulo: 'Calendário Acadêmico 2025/2 – Publicado',
    conteudo:
      'O Calendário Acadêmico do segundo semestre de 2025 já está disponível. Consulte as datas de início e término das aulas, recessos, avaliações e eventos institucionais. O documento pode ser baixado na seção de Arquivos da plataforma.',
    prioridade: 'geral',
    setor: 'Secretaria',
    autor: 'Secretaria Acadêmica',
    avatar: 'https://i.pravatar.cc/40?img=13',
    data: '2025-07-01',
    lidos: 410,
    total: 500,
    fixado: false,
    categoria: 'Acadêmico',
  },
  {
    id: 5,
    titulo: 'Atualização nas Normas de Uso dos Laboratórios',
    conteudo:
      'Em função das novas diretrizes de segurança, as normas de uso dos laboratórios foram atualizadas. É obrigatório o uso de EPI específico em todos os laboratórios de usinagem e elétrica. A lista completa de equipamentos necessários está disponível na recepção e no portal do aluno.',
    prioridade: 'importante',
    setor: 'Segurança',
    autor: 'CIPA – Comissão Interna',
    avatar: 'https://i.pravatar.cc/40?img=16',
    data: '2025-06-28',
    lidos: 220,
    total: 400,
    fixado: false,
    categoria: 'Segurança',
  },
  {
    id: 6,
    titulo: 'Pesquisa de Satisfação – Participe!',
    conteudo:
      'Sua opinião é muito importante para melhorarmos nossos serviços! Acesse o link na seção de Arquivos e responda à Pesquisa de Satisfação 2025. O preenchimento leva apenas 3 minutos e é totalmente anônimo. Todas as respostas contribuem para melhorias reais na sua experiência.',
    prioridade: 'geral',
    setor: 'Qualidade',
    autor: 'Gerência de Qualidade',
    avatar: 'https://i.pravatar.cc/40?img=4',
    data: '2025-06-25',
    lidos: 88,
    total: 500,
    fixado: false,
    categoria: 'Institucional',
  },
];

function formatDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function LidoProgress({ lidos, total }) {
  const pct = Math.round((lidos / total) * 100);
  return (
    <div className="lido-progress">
      <div className="lido-bar"><div className="lido-fill" style={{ width: `${pct}%` }} /></div>
      <span>{lidos}/{total} leram ({pct}%)</span>
    </div>
  );
}

export default function AvisosPage() {
  const [lidos, setLidos] = useState({});
  const [expandido, setExpandido] = useState(null);
  const [filtro, setFiltro] = useState('Todos');

  const categorias = ['Todos', ...new Set(avisos.map((a) => a.categoria))];
  const fixados = avisos.filter((a) => a.fixado);
  const naofixados = avisos.filter((a) => !a.fixado);
  const porFiltro = (list) => filtro === 'Todos' ? list : list.filter((a) => a.categoria === filtro);

  const marcarLido = (id) => setLidos((prev) => ({ ...prev, [id]: true }));

  const renderAviso = (aviso) => {
    const p = prioridades[aviso.prioridade];
    const isLido = lidos[aviso.id];
    const isOpen = expandido === aviso.id;

    return (
      <div
        key={aviso.id}
        className={`aviso-card ${aviso.prioridade} ${isLido ? 'lido' : ''}`}
        onClick={() => { setExpandido(isOpen ? null : aviso.id); marcarLido(aviso.id); }}
      >
        <div className="aviso-stripe" style={{ background: p.color }} />

        <div className="aviso-main">
          <div className="aviso-header">
            <div className="aviso-header-left">
              <span className="aviso-priority-badge" style={{ background: p.color }}>
                {p.icon} {p.label}
              </span>
              {aviso.fixado && <span className="aviso-fixado">📌 Fixado</span>}
              <span className="aviso-cat">{aviso.categoria}</span>
            </div>
            <div className="aviso-header-right">
              {isLido && <span className="lido-badge">✓ Lido</span>}
              <span className="aviso-data">{formatDate(aviso.data)}</span>
            </div>
          </div>

          <h3 className="aviso-titulo">{aviso.titulo}</h3>

          <div className="aviso-autor">
            <img src={aviso.avatar} alt={aviso.autor} />
            <span>{aviso.autor} · <em>{aviso.setor}</em></span>
          </div>

          {isOpen && (
            <div className="aviso-conteudo">
              <p>{aviso.conteudo}</p>
              <LidoProgress lidos={aviso.lidos} total={aviso.total} />
              <div className="aviso-acoes">
                <button className="acao-btn" onClick={(e) => e.stopPropagation()}>📥 Baixar PDF</button>
                <button className="acao-btn" onClick={(e) => e.stopPropagation()}>🔗 Compartilhar</button>
              </div>
            </div>
          )}

          <div className="aviso-expand-hint">
            {isOpen ? '▲ Recolher' : '▼ Ver mais'}
          </div>
        </div>
      </div>
    );
  };

  const naoLidosCount = avisos.filter((a) => !lidos[a.id]).length;

  return (
    <div className="avisos-page">
      {/* Hero */}
      <div className="avisos-hero">
        <div className="avisos-hero-left">
          <span className="avisos-badge">📢 Mural Oficial</span>
          <h1>Avisos & Comunicados</h1>
          <p>Fique por dentro de todas as informações importantes da instituição. Não perca nenhum comunicado.</p>
        </div>
        <div className="avisos-hero-stats">
          <div className="av-stat urgente-s">
            <strong>{avisos.filter((a) => a.prioridade === 'urgente').length}</strong>
            <span>🚨 Urgentes</span>
          </div>
          <div className="av-stat">
            <strong>{naoLidosCount}</strong>
            <span>Não lidos</span>
          </div>
          <div className="av-stat">
            <strong>{avisos.length}</strong>
            <span>Total</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="avisos-filtros">
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`filtro-btn-av ${filtro === cat ? 'active' : ''}`}
            onClick={() => setFiltro(cat)}
          >
            {cat}
          </button>
        ))}
        <button
          className="marcar-todos-btn"
          onClick={() => setLidos(Object.fromEntries(avisos.map((a) => [a.id, true])))}
        >
          ✓ Marcar todos como lidos
        </button>
      </div>

      {/* Fixados */}
      {filtro === 'Todos' && fixados.length > 0 && (
        <div className="avisos-section">
          <h2 className="section-label">📌 Avisos Fixados</h2>
          <div className="avisos-list">{porFiltro(fixados).map(renderAviso)}</div>
        </div>
      )}

      {/* Demais */}
      <div className="avisos-section">
        <h2 className="section-label">🗂 Todos os Comunicados</h2>
        <div className="avisos-list">{porFiltro(naofixados).map(renderAviso)}</div>
      </div>
    </div>
  );
}
