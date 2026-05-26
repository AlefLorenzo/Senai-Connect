import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Aluno' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido do servidor.');
      }

      if (isLogin) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setIsLogin(true); // Vai pro login dps de registrar
        setFormData({ name: '', email: '', password: '', role: 'Aluno' });
        alert(data.message || 'Cadastro realizado com sucesso! Faça login.');
      }
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('API offline. Verifique se o servidor backend está rodando.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="logo-text" style={{color: 'var(--senai-blue-dark)', fontStyle: 'italic', margin: 0}}>SENAI</h1>
          <span className="logo-sub" style={{color: 'var(--senai-blue-dark)', letterSpacing: '2px'}}>CONNECT</span>
          <h2>{isLogin ? 'Entrar' : 'Cadastrar'}</h2>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Nome Completo</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          
          <div className="form-group">
            <label>E-mail institucional</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Perfil</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="Aluno">Aluno</option>
                <option value="Professor">Professor</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '16px'}} disabled={loading}>
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="auth-footer">
          <button type="button" className="auth-switch-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
