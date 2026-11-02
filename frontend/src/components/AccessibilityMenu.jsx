import { useContext, useState, useEffect, useRef } from 'react';
import { Accessibility, Type, Contrast, Volume2, VolumeX, X, RotateCcw, Sparkles, AlignLeft } from 'lucide-react';
import { AccessibilityContext } from '../context/AccessibilityContext';
import './AccessibilityMenu.css';

/**
 * Menu flutuante de acessibilidade — disponível em todas as telas.
 * Permite ajustar fonte, contraste, fonte para dislexia, animações,
 * modo simplificado e leitura da página em voz alta.
 */
const AccessibilityMenu = () => {
  const { prefs, updatePrefs, resetPrefs, speak, stopSpeaking } = useContext(AccessibilityContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const panelRef = useRef(null);

  // Fecha com ESC e para a fala ao desmontar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        stopSpeaking();
        setIsSpeaking(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speak();
      setIsSpeaking(true);
      // A fala termina sozinha; sincroniza o estado do botão
      if ('speechSynthesis' in window) {
        const check = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeaking(false);
            clearInterval(check);
          }
        }, 500);
      }
    }
  };

  const fontSizes = [
    { value: 'normal', label: 'A', desc: 'Normal' },
    { value: 'grande', label: 'A+', desc: 'Grande' },
    { value: 'extra', label: 'A++', desc: 'Extra' },
  ];

  return (
    <>
      <button
        className="a11y-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fechar menu de acessibilidade' : 'Abrir menu de acessibilidade'}
        aria-expanded={isOpen}
        title="Acessibilidade"
      >
        <Accessibility size={26} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="a11y-panel" ref={panelRef} role="dialog" aria-label="Opções de acessibilidade">
          <div className="a11y-panel-header">
            <h3>Acessibilidade</h3>
            <button className="a11y-close" onClick={() => setIsOpen(false)} aria-label="Fechar painel">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="a11y-section">
            <span className="a11y-label"><Type size={16} aria-hidden="true" /> Tamanho da fonte</span>
            <div className="a11y-font-options" role="radiogroup" aria-label="Tamanho da fonte">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  role="radio"
                  aria-checked={prefs.fontSize === size.value}
                  className={`a11y-font-btn ${prefs.fontSize === size.value ? 'active' : ''}`}
                  onClick={() => updatePrefs({ fontSize: size.value })}
                  title={size.desc}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`a11y-toggle ${prefs.highContrast ? 'active' : ''}`}
            onClick={() => updatePrefs({ highContrast: !prefs.highContrast })}
            aria-pressed={prefs.highContrast}
          >
            <Contrast size={18} aria-hidden="true" />
            <span>Alto contraste</span>
            <span className="a11y-switch" aria-hidden="true" />
          </button>

          <button
            className={`a11y-toggle ${prefs.dyslexiaFont ? 'active' : ''}`}
            onClick={() => updatePrefs({ dyslexiaFont: !prefs.dyslexiaFont })}
            aria-pressed={prefs.dyslexiaFont}
          >
            <AlignLeft size={18} aria-hidden="true" />
            <span>Fonte para dislexia</span>
            <span className="a11y-switch" aria-hidden="true" />
          </button>

          <button
            className={`a11y-toggle ${prefs.reducedMotion ? 'active' : ''}`}
            onClick={() => updatePrefs({ reducedMotion: !prefs.reducedMotion })}
            aria-pressed={prefs.reducedMotion}
          >
            <Sparkles size={18} aria-hidden="true" />
            <span>Reduzir animações</span>
            <span className="a11y-switch" aria-hidden="true" />
          </button>

          <button
            className={`a11y-toggle ${prefs.simplifiedMode ? 'active' : ''}`}
            onClick={() => updatePrefs({ simplifiedMode: !prefs.simplifiedMode })}
            aria-pressed={prefs.simplifiedMode}
          >
            <Accessibility size={18} aria-hidden="true" />
            <span>Modo simplificado</span>
            <span className="a11y-switch" aria-hidden="true" />
          </button>

          <button
            className={`a11y-speak-btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleSpeak}
            aria-pressed={isSpeaking}
          >
            {isSpeaking ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
            {isSpeaking ? 'Parar leitura' : 'Ouvir esta página'}
          </button>

          <button className="a11y-reset" onClick={resetPrefs}>
            <RotateCcw size={16} aria-hidden="true" /> Restaurar padrões
          </button>
        </div>
      )}
    </>
  );
};

export default AccessibilityMenu;
