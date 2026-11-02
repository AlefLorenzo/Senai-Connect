import { useState, useEffect } from 'react';
import './XpToast.css';

/**
 * Toasts flutuantes de gamificação: "+10 XP", "Nível X!", "Medalha conquistada!".
 * Ouve os eventos globais disparados pelo SocketContext (tempo real via socket.io).
 */
const XpToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const push = (toast) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, ...toast }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    const onXp = (e) => {
      const { points, label } = e.detail || {};
      push({ icon: '⚡', title: `+${points} XP`, subtitle: label || 'Você ganhou experiência', kind: 'xp' });
    };
    const onLevel = (e) => {
      const { level } = e.detail || {};
      push({ icon: '🎉', title: `Nível ${level} alcançado!`, subtitle: 'Continue contribuindo com a comunidade', kind: 'level' });
    };
    const onBadge = (e) => {
      const { icon, name } = e.detail || {};
      push({ icon: icon || '🏅', title: 'Medalha conquistada!', subtitle: name, kind: 'badge' });
    };

    window.addEventListener('senai:xp_gained', onXp);
    window.addEventListener('senai:level_up', onLevel);
    window.addEventListener('senai:badge_unlocked', onBadge);
    return () => {
      window.removeEventListener('senai:xp_gained', onXp);
      window.removeEventListener('senai:level_up', onLevel);
      window.removeEventListener('senai:badge_unlocked', onBadge);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="xp-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`xp-toast xp-toast--${toast.kind}`} role="status">
          <span className="xp-toast-icon" aria-hidden="true">{toast.icon}</span>
          <div>
            <strong>{toast.title}</strong>
            <small>{toast.subtitle}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default XpToast;
