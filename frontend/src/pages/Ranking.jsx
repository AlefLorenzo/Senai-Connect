import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import LevelChip from '../components/LevelChip';
import './Ranking.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Ranking da comunidade — reconhecimento público dos membros
 * que mais contribuem com o SENAI Connect.
 */
const Ranking = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/gamification/leaderboard`, {
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setLeaders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="ranking-page"><p className="ranking-loading">Carregando ranking...</p></div>;
  }

  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean); // 2º, 1º, 3º

  return (
    <div className="ranking-page">
      <header className="ranking-header">
        <Trophy size={28} aria-hidden="true" />
        <div>
          <h1>Ranking da Comunidade</h1>
          <p>Quem mais contribui com publicações, projetos e conhecimento.</p>
        </div>
      </header>

      {leaders.length === 0 ? (
        <p className="ranking-empty">Ainda não há pontuação. Comece a contribuir para aparecer aqui! ⚡</p>
      ) : (
        <>
          {/* Pódio */}
          <div className="podium" role="list" aria-label="Top 3 do ranking">
            {podiumOrder.map((leader) => {
              const position = leaders.indexOf(leader) + 1;
              return (
                <Link
                  to={`/profile/${leader.id}`}
                  key={leader.id}
                  role="listitem"
                  className={`podium-item podium-${position} ${leader.id === loggedInUser?.id ? 'is-me' : ''}`}
                  aria-label={`${position}º lugar: ${leader.name}, nível ${leader.level}, ${leader.xp} XP`}
                >
                  <span className="podium-medal" aria-hidden="true">
                    {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
                  </span>
                  <Avatar user={leader} className="podium-avatar" />
                  <strong className="podium-name">{leader.name}</strong>
                  <LevelChip level={leader.level} size="lg" />
                  <span className="podium-xp"><Zap size={13} aria-hidden="true" /> {leader.xp} XP</span>
                </Link>
              );
            })}
          </div>

          {/* Demais posições */}
          {rest.length > 0 && (
            <ol className="ranking-list" start="4">
              {rest.map((leader, index) => (
                <li key={leader.id}>
                  <Link
                    to={`/profile/${leader.id}`}
                    className={`ranking-row ${leader.id === loggedInUser?.id ? 'is-me' : ''}`}
                  >
                    <span className="ranking-position">{index + 4}º</span>
                    <Avatar user={leader} className="ranking-avatar" />
                    <div className="ranking-info">
                      <strong>{leader.name} {leader.id === loggedInUser?.id && <em>(você)</em>}</strong>
                      <small>{leader.area || leader.role}{leader.unit ? ` • ${leader.unit}` : ''}</small>
                    </div>
                    <div className="ranking-stats">
                      <span className="ranking-badges" title="Medalhas conquistadas">
                        <Medal size={14} aria-hidden="true" /> {leader.badges_count}
                      </span>
                      <LevelChip level={leader.level} />
                      <span className="ranking-xp"><Zap size={13} aria-hidden="true" /> {leader.xp}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
};

export default Ranking;
