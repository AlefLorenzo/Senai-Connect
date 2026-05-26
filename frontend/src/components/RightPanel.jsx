import React from 'react';
import { Clock, Users, Calendar } from 'lucide-react';
import './RightPanel.css';

const RightPanel = () => {
  return (
    <aside className="right-panel-container">
      {/* Avisos */}
      <div className="widget card">
        <div className="widget-header">
          <h3>Avisos</h3>
          <a href="#" className="see-all">Ver todos</a>
        </div>
        
        <div className="widget-item">
          <div className="widget-icon">
            <Clock size={20} color="#0056D2" />
          </div>
          <div className="widget-content">
            <h4>Manutenção do sistema</h4>
            <p>Hoje, 10:00</p>
            <span className="widget-desc">Sistema indisponível das 22h às 02h.</span>
          </div>
        </div>

        <div className="widget-item">
          <div className="widget-icon">
            <Calendar size={20} color="#0056D2" />
          </div>
          <div className="widget-content">
            <h4>Inscrições abertas</h4>
            <span className="widget-desc">Curso Técnico em Automação. Inscrições até 30/06</span>
          </div>
        </div>
      </div>

      {/* Grupos Sugeridos */}
      <div className="widget card">
        <div className="widget-header">
          <h3>Grupos sugeridos</h3>
          <a href="#" className="see-all">Ver todos</a>
        </div>
        
        <div className="group-card">
          <div className="group-info">
            <div className="group-icon-bg">
              <Users size={24} color="white" />
            </div>
            <div>
              <h4>Programação Web</h4>
              <span>128 membros</span>
            </div>
          </div>
          <button className="btn-participate">Participar</button>
        </div>

        <div className="group-card">
          <div className="group-info">
            <div className="group-icon-bg" style={{backgroundColor: '#6b46c1'}}>
              <Users size={24} color="white" />
            </div>
            <div>
              <h4>Robótica SENAI</h4>
              <span>96 membros</span>
            </div>
          </div>
          <button className="btn-participate">Participar</button>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
