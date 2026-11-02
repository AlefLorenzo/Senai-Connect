import { useState, useEffect } from 'react';
import { Zap, Trophy, History } from 'lucide-react';
import './GamificationPanel.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Painel de gamificação do perfil: nível, barra de XP e medalhas.
 * Mostra o histórico recente de XP apenas no próprio perfil.
 */
const GamificationPanel = ({ userId, isOwnProfile }) => {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const endpoint = isOwnProfile ? '/api/gamification/me' : `/api/gamification/user/${userId}`;
    fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(true);
        else setProgress(data);
      })
      .catch(() => setError(true));
  }, [userId, isOwnProfile]);

  // Atualiza o painel em tempo real quando o próprio usuário ganha XP
  useEffect(() => {
    if (!isOwnProfile) return;
    const refresh = () => {
      fetch(`${API_URL}/api/gamification/me`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => { if (!data.error) setProgress(data); })
        .catch(() => {});
    };
    window.addEventListener('senai:xp_gained', refresh);
    window.addEventListener('senai:badge_unlocked', refresh);
    window.addEventListener('senai:level_up', refresh);
    return () => {
      window.removeEventListener('senai:xp_gained', refresh);
      window.removeEventListener('senai:badge_unlocked', refresh);
      window.removeEventListener('senai:level_up', refresh);
    };
  }, [isOwnProfile]);

  if (error || !progress) return null;

  const earnedBadges = progress.badges.filter(b => b.earned);
  const lockedBadges = progress.badges.filter(b => !b.earned);

  return (
    <section className="gamification-panel card" aria-label="Progresso e conquistas">
      <div className="xp-row">
        <div className="level-circle" aria-label={`Nível ${progress.level}`}>
          <Trophy size={20} aria-hidden="true" />
          <strong>{progress.level}</strong>
        </div>
        <div className="xp-info">
          <div className="xp-numbers">
            <span><Zap size={14} aria-hidden="true" /> {progress.xp} XP</span>
            <span className="xp-next">faltam {progress.xpToNextLevel} XP para o nível {progress.level + 1}</span>
          </div>
          <div
            className="xp-bar"
            role="progressbar"
            aria-valuenow={progress.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso para o nível ${progress.level + 1}`}
          >
            <div className="xp-bar-fill" style={{ width: `${progress.progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="badges-block">
        <h4>Medalhas ({progress.earnedCount}/{progress.badges.length})</h4>
        <div className="badges-grid">
          {earnedBadges.map((badge) => (
            <div key={badge.id} className="badge-item earned" title={`${badge.name} — ${badge.description}`}>
              <span className="badge-icon" aria-hidden="true">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          ))}
          {lockedBadges.map((badge) => (
            <div key={badge.id} className="badge-item locked" title={`Bloqueada: ${badge.description}`}>
              <span className="badge-icon" aria-hidden="true">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {isOwnProfile && progress.recentXp && progress.recentXp.length > 0 && (
        <details className="xp-history">
          <summary><History size={14} aria-hidden="true" /> Histórico recente de XP</summary>
          <ul>
            {progress.recentXp.map((entry, i) => (
              <li key={i}>
                <span>{entry.label}</span>
                <strong>+{entry.points} XP</strong>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
};

export default GamificationPanel;
