import './LevelChip.css';

/**
 * Selo de nível do usuário (gamificação).
 * A cor evolui com o nível: bronze → prata → ouro → platina → diamante.
 */
const LevelChip = ({ level = 1, size = 'sm' }) => {
  const tier =
    level >= 15 ? 'diamante' :
    level >= 10 ? 'platina' :
    level >= 7  ? 'ouro' :
    level >= 4  ? 'prata' : 'bronze';

  return (
    <span
      className={`level-chip level-chip--${tier} level-chip--${size}`}
      title={`Nível ${level} no SENAI Connect`}
      aria-label={`Nível ${level}`}
    >
      Nv. {level}
    </span>
  );
};

export default LevelChip;
