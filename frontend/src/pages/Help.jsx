import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Book, ShieldAlert, Award } from 'lucide-react';

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      icon: <Book size={18} />,
      question: "Como posso criar publicações?",
      answer: "Na tela inicial (Início ou Feed), clique na caixa 'No que você está pensando?', digite seu texto e anexe uma foto, vídeo ou documento se desejar. Depois, basta clicar em 'Publicar'."
    },
    {
      icon: <HelpCircle size={18} />,
      question: "Como posso participar de grupos?",
      answer: "Navegue até a página 'Grupos' no menu lateral ou inferior, explore a lista de grupos disponíveis e clique no botão 'Entrar' do grupo que você deseja participar. Para sair, clique em 'Sair' nos detalhes do grupo."
    },
    {
      icon: <ShieldAlert size={18} />,
      question: "Como funciona a privacidade das minhas publicações?",
      answer: "Suas publicações no Feed principal podem ser visualizadas por todos os alunos e professores cadastrados no SENAI Connect. Publicações feitas dentro de grupos específicos só são exibidas para os membros daquele grupo."
    },
    {
      icon: <Award size={18} />,
      question: "Como alterar minhas informações de perfil?",
      answer: "Vá para o seu perfil clicando no seu avatar (no cabeçalho ou menu lateral), depois clique no botão 'Editar Perfil'. No modal que abrir, você poderá alterar seu avatar (informando uma imagem ou link) e sua biografia."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="help-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#E1F5FE', padding: '10px', borderRadius: '50%', color: '#0288D1', display: 'flex' }}>
          <HelpCircle size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Central de Ajuda</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Dúvidas frequentes e suporte sobre o SENAI Connect.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="card" 
              style={{ 
                padding: '16px', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: isOpen ? '1px solid var(--senai-blue-primary)' : '1px solid var(--border-color)'
              }}
              onClick={() => toggleFaq(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isOpen ? 'var(--senai-blue-primary)' : 'var(--text-primary)', fontWeight: 600 }}>
                  {faq.icon}
                  <span style={{ fontSize: '0.95rem' }}>{faq.question}</span>
                </div>
                {isOpen ? <ChevronUp size={18} color="var(--senai-blue-primary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
              </div>
              
              {isOpen && (
                <div style={{ marginTop: '12px', paddingLeft: '28px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: '20px', textAlign: 'center', background: '#F9FBFD', border: '1px dashed #B3E5FC' }}>
        <h4 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>Ainda precisa de ajuda?</h4>
        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Entre em contato com o suporte de TI da sua unidade do SENAI.
        </p>
        <a 
          href="mailto:suporte.connect@sp.senai.br" 
          className="btn-primary" 
          style={{ textDecoration: 'none', display: 'inline-flex', padding: '10px 20px', fontSize: '0.9rem' }}
        >
          Enviar E-mail para o Suporte
        </a>
      </div>
    </div>
  );
};

export default Help;
