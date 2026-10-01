import { useEffect, useState, type FormEvent, type ReactNode } from "react";

const LOGIN_VIDEO = "/hangar-one-login-background.mp4";

export function HangarGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const session = window.sessionStorage.getItem("hangar-one-auth");
    if (session === "1") setAuthenticated(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user.trim() || !key.trim()) {
      setError("IDENTIFICADOR E CHAVE DE SEGURANÇA SÃO OBRIGATÓRIOS.");
      return;
    }

    setError("");
    window.sessionStorage.setItem("hangar-one-auth", "1");
    setAuthenticated(true);
  };

  if (authenticated) {
    return <div className="login-app-ready">{children}</div>;
  }

  return (
    <main className="hangar-login">
      <video
        className="hangar-login__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hangar-one-login-poster.jpg"
      >
        <source src={LOGIN_VIDEO} type="video/mp4" />
      </video>

      <div className="hangar-login__shade" aria-hidden="true" />
      <div className="hangar-login__scanlines" aria-hidden="true" />

      <section className="hangar-login__panel" aria-labelledby="hangar-login-title">
        <div className="hangar-login__panel-glow" aria-hidden="true" />

        <div className="hangar-login__header">
          <span>HANGAR ONE // SECURE ACCESS</span>
          <i>SYS.01</i>
        </div>

        <div className="hangar-login__status">
          <span className="hangar-login__status-dot" />
          <span>LINK ESTABLISHED</span>
        </div>

        <h1 id="hangar-login-title">
          SYSTEM <strong>ONLINE</strong>
        </h1>

        <p className="hangar-login__subtitle">
          AUTENTICAÇÃO DO TERMINAL DE BANCADA
        </p>

        <form onSubmit={handleSubmit} className="hangar-login__form">
          <label>
            <span>ACCESS ID / USER</span>
            <input
              type="text"
              value={user}
              onChange={(event) => {
                setUser(event.target.value);
                setError("");
              }}
              placeholder="Insira seu identificador..."
              autoComplete="username"
              autoFocus
            />
          </label>

          <label>
            <span>SECURITY KEY</span>
            <input
              type="password"
              value={key}
              onChange={(event) => {
                setKey(event.target.value);
                setError("");
              }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="hangar-login__error">{error}</p>}

          <button type="submit" className="hangar-login__button">
            <span className="hangar-login__button-sweep" />
            <span>AUTENTICAR</span>
            <b>›</b>
          </button>
        </form>

        <div className="hangar-login__footer">
          <span>CHANNEL: ENCRYPTED</span>
          <span>READY</span>
        </div>

        <i className="login-corner login-corner--tl" />
        <i className="login-corner login-corner--tr" />
        <i className="login-corner login-corner--bl" />
        <i className="login-corner login-corner--br" />
      </section>
    </main>
  );
}
