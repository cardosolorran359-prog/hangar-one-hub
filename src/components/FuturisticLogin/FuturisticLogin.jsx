import React, { useState, useEffect } from 'react';
import './FuturisticLogin.css';

export default function FuturisticLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanEffect, setScanEffect] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanEffect((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="futuristic-login">
      {/* Background com grid animado */}
      <div className="background">
        <div className="grid-background"></div>
        <div className="particles">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--delay': `${i * 0.1}s`,
              '--duration': `${3 + i * 0.5}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Elementos flutuantes */}
      <div className="floating-circles">
        <div className="float-circle float-1"></div>
        <div className="float-circle float-2"></div>
        <div className="float-circle float-3"></div>
        <div className="float-circle float-4"></div>
        <div className="float-circle float-5"></div>
      </div>

      {/* HUD principal */}
      <div className="hud-container">
        <div className="central-circle">
          {/* Círculos concêntricos */}
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
          <div className="circle circle-4"></div>
          <div className="circle circle-5"></div>

          {/* Linhas de conexão */}
          <svg className="connection-lines" viewBox="0 0 400 400">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffff" />
                <stop offset="100%" stopColor="#ff0080" />
              </linearGradient>
            </defs>
            {/* Linhas principais */}
            <line x1="200" y1="80" x2="200" y2="140" stroke="url(#lineGradient)" strokeDasharray="5,5" strokeDashoffset={scanEffect} />
            <line x1="200" y1="260" x2="200" y2="320" stroke="url(#lineGradient)" strokeDasharray="5,5" strokeDashoffset={scanEffect} />
            <line x1="80" y1="200" x2="140" y2="200" stroke="url(#lineGradient)" strokeDasharray="5,5" strokeDashoffset={scanEffect} />
            <line x1="260" y1="200" x2="320" y2="200" stroke="url(#lineGradient)" strokeDasharray="5,5" strokeDashoffset={scanEffect} />

            {/* Linhas diagonais */}
            <line x1="120" y1="120" x2="160" y2="160" stroke="url(#lineGradient)" strokeDasharray="3,3" opacity="0.5" />
            <line x1="280" y1="120" x2="240" y2="160" stroke="url(#lineGradient)" strokeDasharray="3,3" opacity="0.5" />
            <line x1="120" y1="280" x2="160" y2="240" stroke="url(#lineGradient)" strokeDasharray="3,3" opacity="0.5" />
            <line x1="280" y1="280" x2="240" y2="240" stroke="url(#lineGradient)" strokeDasharray="3,3" opacity="0.5" />
          </svg>

          {/* Pontos de interação animados */}
          <div className="interaction-point top"></div>
          <div className="interaction-point bottom"></div>
          <div className="interaction-point left"></div>
          <div className="interaction-point right"></div>

          {/* Triângulos decorativos */}
          <div className="triangle-deco top-left"></div>
          <div className="triangle-deco top-right"></div>
          <div className="triangle-deco bottom-left"></div>
          <div className="triangle-deco bottom-right"></div>

          {/* Form container */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <div className="header-bar"></div>
              <h1 className="glitch-text">HANGAR ONE</h1>
              <p className="header-subtitle">ACCESS PROTOCOL</p>
              <div className="scan-line"></div>
            </div>

            {/* Input de Email */}
            <div className="input-group">
              <div className="input-wrapper">
                <label className="input-label">EMAIL</label>
                <input
                  type="email"
                  placeholder="ENTER EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="futuristic-input"
                  required
                />
                <div className="input-border"></div>
                <div className="input-glow"></div>
              </div>
            </div>

            {/* Input de Password */}
            <div className="input-group">
              <div className="input-wrapper">
                <label className="input-label">PASSWORD</label>
                <input
                  type="password"
                  placeholder="ENTER PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="futuristic-input"
                  required
                />
                <div className="input-border"></div>
                <div className="input-glow"></div>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="button-text">
                {loading ? '⚡ PROCESSING ⚡' : '► INITIATE ACCESS'}
              </span>
              <div className="button-glow"></div>
              <div className="button-border"></div>
              <span className="scan-effect"></span>
            </button>

            {/* Links adicionais */}
            <div className="footer-links">
              <a href="#forgot" className="link-item">FORGOT PASSWORD?</a>
              <span className="divider">|</span>
              <a href="#signup" className="link-item">CREATE ACCOUNT</a>
            </div>
          </form>

          {/* Status panel esquerdo */}
          <div className="side-panel left-panel">
            <div className="panel-header">SYS STATUS</div>
            <div className="panel-content">
              <div className="status-line">
                <span className="status-label">CPU:</span>
                <span className="status-value">87%</span>
              </div>
              <div className="status-line">
                <span className="status-label">MEM:</span>
                <span className="status-value">42%</span>
              </div>
              <div className="status-line">
                <span className="status-label">NET:</span>
                <span className="status-value online">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Status panel direito */}
          <div className="side-panel right-panel">
            <div className="panel-header">SECURITY</div>
            <div className="panel-content">
              <div className="status-line">
                <span className="status-label">ENC:</span>
                <span className="status-value">AES-256</span>
              </div>
              <div className="status-line">
                <span className="status-label">SSL:</span>
                <span className="status-value online">ACTIVE</span>
              </div>
              <div className="status-line">
                <span className="status-label">VER:</span>
                <span className="status-value">3.1.7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Radar corners */}
      <div className="corner-radar top-left"></div>
      <div className="corner-radar top-right"></div>
      <div className="corner-radar bottom-left"></div>
      <div className="corner-radar bottom-right"></div>
    </div>
  );
}
