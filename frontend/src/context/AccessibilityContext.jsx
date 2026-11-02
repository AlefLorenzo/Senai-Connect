import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const AccessibilityContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_PREFS = {
    fontSize: 'normal',      // normal | grande | extra
    highContrast: false,     // alto contraste
    dyslexiaFont: false,     // fonte amigável para dislexia
    reducedMotion: false,    // reduz animações
    simplifiedMode: false,   // modo simplificado (menos distrações)
};

const STORAGE_KEY = 'senai_connect_a11y';

function loadLocalPrefs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    } catch { /* ignora */ }
    return { ...DEFAULT_PREFS };
}

function applyPrefs(prefs) {
    const root = document.documentElement;
    root.dataset.fontSize = prefs.fontSize;
    root.dataset.contrast = prefs.highContrast ? 'high' : 'normal';
    root.dataset.a11yFont = prefs.dyslexiaFont ? 'dyslexia' : 'default';
    root.dataset.motion = prefs.reducedMotion ? 'reduced' : 'normal';
    root.dataset.mode = prefs.simplifiedMode ? 'simplified' : 'full';
}

export const AccessibilityProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [prefs, setPrefs] = useState(loadLocalPrefs);

    // Aplica no <html> sempre que mudar
    useEffect(() => {
        applyPrefs(prefs);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* ignora */ }
    }, [prefs]);

    // Ao logar, busca as preferências salvas no servidor (valem mais que as locais)
    useEffect(() => {
        if (!user) return;
        const token = sessionStorage.getItem('token');
        if (!token) return;
        fetch(`${API_URL}/api/users/me/accessibility`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.prefs) setPrefs(prev => ({ ...prev, ...data.prefs }));
            })
            .catch(() => { /* offline: mantém local */ });
    }, [user]);

    const updatePrefs = useCallback((partial) => {
        setPrefs(prev => {
            const next = { ...prev, ...partial };
            // Persiste no servidor se logado (melhor esforço)
            const token = sessionStorage.getItem('token');
            if (token) {
                fetch(`${API_URL}/api/users/me/accessibility`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ prefs: next })
                }).catch(() => { /* offline: mantém local */ });
            }
            return next;
        });
    }, []);

    const resetPrefs = useCallback(() => {
        updatePrefs({ ...DEFAULT_PREFS });
    }, [updatePrefs]);

    /**
     * Leitura em voz alta (Web Speech API) de um texto ou do conteúdo principal da página.
     * Funciona sem nenhuma dependência externa.
     */
    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) {
            alert('Seu navegador não suporta leitura em voz alta.');
            return;
        }
        window.speechSynthesis.cancel();

        let content = text;
        if (!content) {
            const main = document.querySelector('.center-feed') || document.querySelector('main');
            content = main ? main.innerText : document.body.innerText;
        }
        // Limita para não travar a fala em páginas enormes
        content = content.replace(/\s+/g, ' ').trim().slice(0, 4000);
        if (!content) return;

        const utterance = new SpeechSynthesisUtterance(content);
        utterance.lang = 'pt-BR';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    }, []);

    const stopSpeaking = useCallback(() => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }, []);

    return (
        <AccessibilityContext.Provider value={{ prefs, updatePrefs, resetPrefs, speak, stopSpeaking }}>
            {children}
        </AccessibilityContext.Provider>
    );
};
