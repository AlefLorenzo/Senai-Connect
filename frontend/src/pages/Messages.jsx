import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Send, Phone, Video, MoreVertical, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Messages.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Messages = () => {
  const { user } = useContext(AuthContext);
  
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [history, setHistory] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const chatBodyRef = useRef(null);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/contacts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Erro ao buscar contatos:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Poll contacts list every 4 seconds to catch new messages and unread counts
    const interval = setInterval(fetchContacts, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chat history for selected contact
  const fetchHistory = async (contactId) => {
    if (!contactId) return;
    try {
      const res = await fetch(`${API_URL}/api/messages/${contactId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
  };

  useEffect(() => {
    if (selectedContact) {
      fetchHistory(selectedContact.id);
      
      // Setup polling for active conversation every 2.5 seconds
      const chatInterval = setInterval(() => {
        fetchHistory(selectedContact.id);
      }, 2500);

      return () => clearInterval(chatInterval);
    } else {
      setHistory([]);
    }
  }, [selectedContact]);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedContact) return;

    const tempText = messageText;
    setMessageText('');

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ receiverId: selectedContact.id, content: tempText })
      });
      
      if (res.ok) {
        const data = await res.json();
        setHistory(prev => [...prev, data]);
        fetchContacts(); // Update last message in contacts sidebar
      } else {
        alert('Erro ao enviar mensagem.');
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="messages-layout card">
      <div className="messages-sidebar">
        <div className="messages-header">
          <h2>Mensagens</h2>
        </div>
        <div className="messages-search">
          <Search size={18} color="#65676B" />
          <input 
            type="text" 
            placeholder="Pesquisar contatos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="contact-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => {
              const isActive = selectedContact?.id === contact.id;
              const contactAvatar = contact.avatar ? `/uploads/avatars/${contact.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=0D8ABC&color=fff`;
              const hasUnread = contact.unread_count > 0;
              
              return (
                <div 
                  key={contact.id} 
                  className={`contact-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <img src={contactAvatar} alt={contact.name} className="contact-avatar" />
                  <div className="contact-info">
                    <h4 style={{ fontWeight: hasUnread ? '700' : '500' }}>{contact.name}</h4>
                    <p style={{ fontWeight: hasUnread ? '600' : 'normal', color: hasUnread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {contact.last_message || 'Nenhuma mensagem ainda'}
                    </p>
                  </div>
                  {hasUnread && (
                    <span style={{ background: 'var(--senai-blue-primary)', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', marginRight: '6px' }}>
                      {contact.unread_count}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Nenhum contato encontrado.
            </div>
          )}
        </div>
      </div>
      
      <div className="messages-chat">
        {selectedContact ? (
          <>
            <div className="chat-header">
              <div className="chat-user">
                <img 
                  src={selectedContact.avatar ? `/uploads/avatars/${selectedContact.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.name)}&background=0D8ABC&color=fff`} 
                  alt={selectedContact.name} 
                />
                <div>
                  <h3>{selectedContact.name}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{selectedContact.role || 'Estudante'}</span>
                </div>
              </div>
              <div className="chat-actions">
                <Phone size={20} color="#0056D2" onClick={() => alert('Ligando... (Função em desenvolvimento)')} />
                <Video size={20} color="#0056D2" onClick={() => alert('Iniciando videochamada... (Função em desenvolvimento)')} />
                <MoreVertical size={20} color="#65676B" />
              </div>
            </div>
            
            <div className="chat-body" ref={chatBodyRef}>
              {history.length > 0 ? (
                history.map((msg) => {
                  const isSent = msg.sender_id === user?.id;
                  return (
                    <div 
                      key={msg.id} 
                      className={`chat-bubble ${isSent ? 'sent' : 'received'}`}
                      style={{ margin: '4px 0' }}
                    >
                      <div>{msg.content}</div>
                      <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '4px', opacity: 0.8 }}>
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '8px' }}>
                  <MessageSquare size={32} />
                  <span>Envie uma mensagem para iniciar a conversa!</span>
                </div>
              )}
            </div>
            
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Digite uma mensagem..." 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={!messageText.trim()} style={{ border: 'none', cursor: 'pointer' }}>
                <Send size={18} color="white" />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '12px' }}>
            <MessageSquare size={48} />
            <h3>Selecione um contato para conversar</h3>
            <p style={{ fontSize: '13px' }}>Seus chats recentes e lista de contatos aparecem no menu à esquerda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
