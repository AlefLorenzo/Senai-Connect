import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Send, Phone, Video, MoreVertical, MessageSquare, ArrowLeft, Check, CheckCheck, Paperclip } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Avatar from '../components/Avatar';
import './Messages.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [history, setHistory] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const chatBodyRef = useRef(null);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/contacts`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
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
  }, []);

  const fetchHistory = async (contactId) => {
    if (!contactId) return;
    try {
      const res = await fetch(`${API_URL}/api/messages/${contactId}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        // Marking as read might have updated our contacts list unread count, let's refresh contacts
        fetchContacts();
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
  };

  useEffect(() => {
    if (selectedContact) {
      fetchHistory(selectedContact.id);
      setShowMobileChat(true);
    } else {
      setHistory([]);
      setShowMobileChat(false);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg) => {
        // If it belongs to the current chat
        if (selectedContact && (msg.sender_id === selectedContact.id || msg.receiver_id === selectedContact.id)) {
          setHistory(prev => [...prev, msg]);
          // Re-fetch to mark as read immediately if chat is open
          if (msg.sender_id === selectedContact.id) {
             fetchHistory(selectedContact.id);
          }
        } else {
          // If not in current chat, just refresh contacts to show badge
          fetchContacts();
        }
      };

      const handleMessagesRead = (data) => {
        if (selectedContact && data.byUserId === selectedContact.id) {
           setHistory(prev => prev.map(m => m.status === 'enviada' ? { ...m, status: 'lida' } : m));
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('messages_read', handleMessagesRead);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('messages_read', handleMessagesRead);
      };
    }
  }, [socket, selectedContact]);

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
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ receiverId: selectedContact.id, content: tempText, message_type: 'text' })
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

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`messages-layout card ${showMobileChat ? 'show-chat-mobile' : ''}`}>
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
              const hasUnread = contact.unread_count > 0;
              
              return (
                <div 
                  key={contact.id} 
                  className={`contact-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <Avatar user={contact} className="contact-avatar" />
                  <div className="contact-info">
                    <h4 style={{ fontWeight: hasUnread ? '700' : '500' }}>{contact.name}</h4>
                    <p style={{ fontWeight: hasUnread ? '600' : 'normal', color: hasUnread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {contact.last_message || 'Nenhuma mensagem ainda'}
                    </p>
                  </div>
                  {hasUnread && (
                    <span className="unread-badge">
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
                <button className="mobile-back-btn" onClick={() => setShowMobileChat(false)}>
                   <ArrowLeft size={24} />
                </button>
                <Avatar user={selectedContact} style={{ width: '40px', height: '40px' }} />
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
                  const isRead = msg.status === 'lida';
                  return (
                    <div 
                      key={msg.id} 
                      className={`chat-bubble ${isSent ? 'sent' : 'received'}`}
                      style={{ margin: '4px 0' }}
                    >
                      <div className="chat-bubble-content">
                         {msg.message_type === 'image' && msg.media_url && (
                            <img src={msg.media_url} alt="Media" className="chat-media-img" />
                         )}
                         {msg.content && <div>{msg.content}</div>}
                      </div>
                      <div className="chat-bubble-meta">
                        <span>{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isSent && (
                          <span className="read-receipt" style={{ color: isRead ? '#4FC3F7' : 'var(--text-secondary)' }}>
                            {isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                          </span>
                        )}
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
              <button type="button" className="icon-btn-transparent" onClick={() => alert('Anexos (em breve)')}>
                 <Paperclip size={20} color="#65676B" />
              </button>
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
          <div className="chat-empty-state">
            <MessageSquare size={48} />
            <h3>Selecione um contato para conversar</h3>
            <p>Seus chats recentes e lista de contatos aparecem no menu à esquerda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
