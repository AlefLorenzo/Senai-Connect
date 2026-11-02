import { useState, useEffect } from 'react';
import { Plus, X, BadgeCheck, ThumbsUp, GraduationCap } from 'lucide-react';
import Avatar from './Avatar';
import './SkillsSection.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PROFICIENCY_LABELS = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

/**
 * Seção de habilidades do perfil com validação social.
 * Validações de professores recebem selo especial ("Validada por professor").
 */
const SkillsSection = ({ userId, isOwnProfile }) => {
  const [skills, setSkills] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [proficiency, setProficiency] = useState('iniciante');
  const [loading, setLoading] = useState(false);

  const token = () => sessionStorage.getItem('token');

  const fetchSkills = () => {
    fetch(`${API_URL}/api/skills/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token()}` }
    })
      .then(res => res.json())
      .then(data => { if (!data.error) setSkills(data); })
      .catch(err => console.error(err));
  };

  useEffect(() => { if (userId) fetchSkills(); }, [userId]);

  // Busca no catálogo conforme digita
  useEffect(() => {
    if (!showForm) return;
    const timer = setTimeout(() => {
      fetch(`${API_URL}/api/skills/catalog?q=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token()}` }
      })
        .then(res => res.json())
        .then(data => { if (!data.error) setCatalog(data); })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [search, showForm]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedSkill && !search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
        body: JSON.stringify({
          skill_id: selectedSkill?.id,
          name: selectedSkill ? undefined : search.trim(),
          proficiency,
        }),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        setSearch('');
        setSelectedSkill(null);
        setProficiency('iniciante');
        setShowForm(false);
        fetchSkills();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userSkillId) => {
    if (!window.confirm('Remover esta habilidade do seu perfil?')) return;
    await fetch(`${API_URL}/api/skills/${userSkillId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token()}` }
    });
    fetchSkills();
  };

  const handleEndorse = async (skill) => {
    const method = skill.endorsed_by_me ? 'DELETE' : 'POST';
    const res = await fetch(`${API_URL}/api/skills/${skill.user_skill_id}/endorse`, {
      method,
      headers: { 'Authorization': `Bearer ${token()}` }
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    else fetchSkills();
  };

  return (
    <section className="skills-section" aria-label="Habilidades">
      <div className="skills-header">
        <h3>Habilidades</h3>
        {isOwnProfile && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} aria-hidden="true" /> Adicionar
          </button>
        )}
      </div>

      {showForm && (
        <form className="skill-form" onSubmit={handleAdd}>
          <div className="skill-search-wrapper">
            <input
              type="text"
              value={selectedSkill ? selectedSkill.name : search}
              onChange={(e) => { setSearch(e.target.value); setSelectedSkill(null); }}
              placeholder="Buscar ou digitar nova habilidade..."
              aria-label="Nome da habilidade"
              maxLength={100}
              required
            />
            {!selectedSkill && catalog.length > 0 && search && (
              <ul className="skill-suggestions" role="listbox">
                {catalog.slice(0, 6).map((s) => (
                  <li key={s.id}>
                    <button type="button" role="option" onClick={() => { setSelectedSkill(s); setSearch(s.name); }}>
                      {s.name} <small>{s.category}</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            aria-label="Nível de proficiência"
          >
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {skills.length === 0 ? (
        <p className="skills-empty">
          {isOwnProfile
            ? 'Adicione suas habilidades técnicas e receba validações de professores e colegas.'
            : 'Este usuário ainda não adicionou habilidades.'}
        </p>
      ) : (
        <ul className="skills-list">
          {skills.map((skill) => (
            <li key={skill.user_skill_id} className={`skill-card ${skill.teacher_count > 0 ? 'teacher-validated' : ''}`}>
              <div className="skill-main">
                <div className="skill-title-row">
                  <strong>{skill.name}</strong>
                  <span className="skill-category">{skill.category}</span>
                </div>
                <div className="skill-meta">
                  <span className={`skill-proficiency prof-${skill.proficiency}`}>
                    {PROFICIENCY_LABELS[skill.proficiency]}
                  </span>
                  {skill.teacher_count > 0 && (
                    <span className="skill-teacher-badge" title={`Validada por ${skill.teacher_count} professor(es)`}>
                      <GraduationCap size={13} aria-hidden="true" />
                      Validada por professor
                    </span>
                  )}
                  {skill.endorsements_count > 0 && (
                    <span className="skill-endorsements">
                      <BadgeCheck size={13} aria-hidden="true" />
                      {skill.endorsements_count} validação(ões)
                    </span>
                  )}
                </div>
                {skill.endorsers && skill.endorsers.length > 0 && (
                  <div className="skill-endorsers" title="Quem validou">
                    {skill.endorsers.map((e) => (
                      <Avatar key={e.id} user={{ avatar: e.avatar, name: e.name }} className="endorser-avatar" />
                    ))}
                  </div>
                )}
              </div>
              <div className="skill-actions">
                {isOwnProfile ? (
                  <button
                    className="skill-remove"
                    onClick={() => handleRemove(skill.user_skill_id)}
                    aria-label={`Remover habilidade ${skill.name}`}
                    title="Remover"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    className={`skill-endorse-btn ${skill.endorsed_by_me ? 'endorsed' : ''}`}
                    onClick={() => handleEndorse(skill)}
                    aria-pressed={!!skill.endorsed_by_me}
                    aria-label={`${skill.endorsed_by_me ? 'Remover validação de' : 'Validar'} ${skill.name}`}
                  >
                    <ThumbsUp size={15} aria-hidden="true" />
                    {skill.endorsed_by_me ? 'Validada' : 'Validar'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SkillsSection;
