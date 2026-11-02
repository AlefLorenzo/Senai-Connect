import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Trash2, Briefcase, X } from 'lucide-react';
import './PortfolioSection.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Portfólio de projetos do usuário — o "currículo vivo" do SENAI Connect.
 */
const PortfolioSection = ({ userId, isOwnProfile }) => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const token = () => sessionStorage.getItem('token');

  const fetchProjects = () => {
    fetch(`${API_URL}/api/projects/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token()}` }
    })
      .then(res => res.json())
      .then(data => { if (!data.error) setProjects(data); })
      .catch(err => console.error(err));
  };

  useEffect(() => { if (userId) fetchProjects(); }, [userId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
        body: JSON.stringify({
          title,
          description,
          project_url: projectUrl,
          tags,
        }),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        setTitle(''); setDescription(''); setProjectUrl(''); setTags('');
        setShowForm(false);
        fetchProjects();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remover este projeto do portfólio?')) return;
    await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token()}` }
    });
    fetchProjects();
  };

  return (
    <section className="portfolio-section" aria-label="Portfólio de projetos">
      <div className="portfolio-header">
        <h3><Briefcase size={18} aria-hidden="true" /> Portfólio de Projetos</h3>
        {isOwnProfile && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} aria-hidden="true" /> Novo projeto
          </button>
        )}
      </div>

      {showForm && (
        <form className="project-form" onSubmit={handleAdd}>
          <div className="project-form-header">
            <h4>Adicionar projeto</h4>
            <button type="button" className="skill-remove" onClick={() => setShowForm(false)} aria-label="Fechar formulário">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do projeto *"
            maxLength={150}
            required
            aria-label="Título do projeto"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o projeto: o que faz, tecnologias usadas, seu papel..."
            rows={3}
            aria-label="Descrição do projeto"
          />
          <input
            type="url"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="Link (GitHub, Behance, vídeo...)"
            aria-label="Link do projeto"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags separadas por vírgula (ex: Arduino, C++, Robótica)"
            aria-label="Tags do projeto"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar projeto (+20 XP)'}
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <p className="portfolio-empty">
          {isOwnProfile
            ? 'Mostre o que você já construiu! Projetos publicados rendem XP e fortalecem seu currículo.'
            : 'Este usuário ainda não publicou projetos.'}
        </p>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <article key={project.id} className="project-card">
              {project.image_url && (
                <img src={project.image_url} alt={`Imagem do projeto ${project.title}`} className="project-image" loading="lazy" />
              )}
              <div className="project-body">
                <div className="project-title-row">
                  <h4>{project.title}</h4>
                  {isOwnProfile && (
                    <button
                      className="skill-remove"
                      onClick={() => handleRemove(project.id)}
                      aria-label={`Remover projeto ${project.title}`}
                      title="Remover projeto"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
                {project.description && <p>{project.description}</p>}
                {project.tags && (
                  <div className="project-tags">
                    {project.tags.split(',').map((tag, i) => (
                      <span key={i} className="project-tag">{tag.trim()}</span>
                    ))}
                  </div>
                )}
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    <ExternalLink size={14} aria-hidden="true" /> Ver projeto
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PortfolioSection;
