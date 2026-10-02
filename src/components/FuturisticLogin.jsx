import React, { useState } from 'react';
import './FuturisticLogin.css';

export default function FuturisticLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simular login
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="futuristic-login">
      {/* Background com animações */}
      <div className="background">
        <div className="grid-background"></div>
        <div className="particles"></div>
      </div>

      {/* HUD principal - Círculos concêntricos animados */}
      <div className="hud-container">
        <div className="central-circle">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
          <div className="circle circle-4"></div>

          {/* Linhas conectoras */}
          <svg className="connection-lines" viewBox="0 0 400 400">
            <line x1="200" y1="50" x2="200" y2="150" strokeDasharray="5,5" />
            <line x1="200" y1="250" x2="200" y2="350" strokeDasharray="5,5" />
            <line x1="50" y1="200" x2="150" y2="200" strokeDasharray="5,5" />
            <line x1="250" y1="200" x2="350" y2="200" strokeDasharray="5,5" />
          </svg>

          {/* Pontos de interação */}
          <div className="interaction-point top"></div>
          <div className="interaction-point bottom"></div>
          <div className="interaction-point left"></div>
          <div className="interaction-point right"></div>

          {/* Form container */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h1 className="glitch-text">ACCESS PROTOCOL</h1>
              <p className="scan-line">▓▒░ INITIALIZING ░▒▓</p>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="ENTER EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="futuristic-input"
                />
                <div className="input-border"></div>
                <span className="input-label">EMAIL</span>
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="ENTER PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="futuristic-input"
                />
                <div className="input-border"></div>
                <span className="input-label">PASSWORD</span>
              </div>
            </div>

            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="button-text">
                {loading ? 'PROCESSING...' : 'INITIATE ACCESS'}
              </span>
              <div className="button-glow"></div>
              <span className="scan-effect"></span>
            </button>
          </form>

          {/* Status panel */}
          <div className="status-panel">
            <div className="status-item">
              <span className="status-label">SYS:</span>
              <span className="status-value online">ONLINE</span>
            </div>
            <div className="status-item">
              <span className="status-label">SEC:</span>
              <span className="status-value">READY</span>
            </div>
          </div>
        </div>

        {/* Elementos decorativos nas laterais */}
        <div className="side-panels">
          <div className="panel left-panel">
            <div className="panel-header">DATA</div>
            <div className="panel-content">
              <div className="data-line"></div>
              <div className="data-line"></div>
              <div className="data-line"></div>
            </div>
          </div>
          <div className="panel right-panel">
            <div className="panel-header">SECURITY</div>
            <div className="panel-content">
              <div className="data-line"></div>
              <div className="data-line"></div>
              <div className="data-line"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Elementos flutuantes de background */}
      <div className="floating-circles">
        <div className="float-circle float-1"></div>
        <div className="float-circle float-2"></div>
        <div className="float-circle float-3"></div>
      </div>
    </div>
  );
}
