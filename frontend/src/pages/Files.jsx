import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Files = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/posts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter only posts with attachments
          const postsWithFiles = data.filter(p => p.attachment_url);
          setFiles(postsWithFiles);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredFiles = files.filter(file => 
    file.attachment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        Carregando arquivos da comunidade...
      </div>
    );
  }

  return (
    <div className="files-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#E8F5E9', padding: '10px', borderRadius: '50%', color: '#4CAF50', display: 'flex' }}>
            <FileText size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Arquivos da Comunidade</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Acesse materiais de aula, PDFs e apostilas compartilhadas por professores e alunos.
            </p>
          </div>
        </div>
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '4px 12px', background: 'var(--bg-card)' }}>
          <Search size={18} color="#65676B" style={{ marginRight: '6px' }} />
          <input 
            type="text" 
            placeholder="Buscar arquivos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '200px', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredFiles.length > 0 ? (
          filteredFiles.map(file => (
            <div key={file.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#FFEBEE', padding: '12px', borderRadius: '8px', color: '#E53935', display: 'flex' }}>
                  <FileText size={28} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {file.attachment_name || 'Arquivo Compartilhado'}
                  </h4>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Compartilhado por <strong>{file.user_name}</strong> • {new Date(file.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                    "{file.content.substring(0, 100)}{file.content.length > 100 ? '...' : ''}"
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a 
                  href={file.attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary" 
                  style={{ textDecoration: 'none', display: 'inline-flex', padding: '8px 12px', fontSize: '0.85rem', gap: '6px' }}
                >
                  <ExternalLink size={16} />
                  <span>Abrir</span>
                </a>
                <a 
                  href={file.attachment_url} 
                  download={file.attachment_name}
                  className="btn-primary" 
                  style={{ textDecoration: 'none', display: 'inline-flex', padding: '8px 12px', fontSize: '0.85rem', gap: '6px' }}
                >
                  <Download size={16} />
                  <span>Baixar</span>
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhum arquivo encontrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;
