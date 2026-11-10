import { useCallback, useEffect, useState } from "react";
import { Ticket, LogOut } from "lucide-react";

import { api } from "./api";
import Auth from "./components/Auth";
import Workspace from "./components/Workspace";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      setLoading(true);
      setError("");

      try {
        setUser(await api.currentUser(controller.signal));
      } catch (error) {
        if (error.name !== "AbortError" && !error.sessionExpired) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    restoreSession();

    return () => controller.abort();
  }, [retry]);

  const sessionExpired = useCallback(() => {
    setUser(null);
    setError("");
  }, []);

  async function signOut() {
    setSigningOut(true);
    setError("");

    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      if (error.sessionExpired) setUser(null);
      else setError(error.message);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="brand-icon">
            <Ticket size={21} />
          </span>
          Ticket Desk
        </div>

        {user && (
          <div className="actions">
            <span className="account-name">{user.username}</span>
            <button
              className="btn quiet"
              onClick={signOut}
              disabled={signingOut}
            >
              <LogOut size={16} />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </header>

      {error && (
        <div className="app-error" role="alert">
          <p>{error}</p>
          {!user && (
            <button className="btn" onClick={() => setRetry(retry + 1)}>
              Retry connection
            </button>
          )}
        </div>
      )}

      {loading ? (
        <main>
          <p role="status" className="muted">
            Loading your workspace…
          </p>
        </main>
      ) : user ? (
        <Workspace
          key={user.id}
          user={user}
          onSessionExpired={sessionExpired}
        />
      ) : (
        <Auth
          onLogin={(account) => {
            setUser(account);
            setError("");
          }}
        />
      )}
    </div>
  );
}
