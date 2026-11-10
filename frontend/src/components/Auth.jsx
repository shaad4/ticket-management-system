import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
export default function Auth({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    if (register && !name) return setError("Please enter your name.");
    if (register && data.get("password") !== data.get("confirm"))
      return setError("Passwords do not match.");
    onLogin({
      id: register ? `user-${Date.now()}` : "1",
      name: register ? name : "Alex Morgan",
      role: "user",
    });
  }
  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">LESS FRICTION. MORE FOCUS.</p>
        <h1>
          Good support starts
          <br />
          with a clear request.
        </h1>
        <p className="muted">
          One quiet place to raise an issue, follow its progress,
          <br className="desktop-break" /> and get back to what matters.
        </p>
        <div className="auth-note">
          <ShieldCheck size={20} />
          <span>Simple to submit. Easy to follow.</span>
        </div>
      </section>
      <section className="panel auth-card">
        <p className="eyebrow">TICKET DESK</p>
        <h2>{register ? "Create your account" : "Welcome back"}</h2>
        <p className="muted">
          {register
            ? "A fresh start for your support requests."
            : "Sign in to your support workspace."}
        </p>
        <form className="form-stack" onSubmit={submit} key={String(register)}>
          {register && (
            <label className="field">
              Full name
              <input name="name" autoComplete="name" required maxLength={80} />
            </label>
          )}
          <label className="field">
            Email address
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              placeholder="At least 8 characters"
              autoComplete={register ? "new-password" : "current-password"}
              required
            />
          </label>
          {register && (
            <label className="field">
              Confirm password
              <input
                name="confirm"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary" type="submit">
            {register ? "Create account" : "Sign in"}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="auth-switch muted">
          {register ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => {
              setRegister(!register);
              setError("");
            }}
          >
            {register ? "Sign in" : "Create an account"}
          </button>
        </p>
        <div className="demo-box">
          <strong>Just exploring?</strong>
          <p>Local demo only. No credentials are verified or saved.</p>
          <div className="actions">
            <button
              className="btn"
              onClick={() =>
                onLogin({ id: "1", name: "Alex Morgan", role: "user" })
              }
            >
              Try user demo
            </button>
            <button
              className="btn"
              onClick={() =>
                onLogin({ id: "admin", name: "Sam Chen", role: "admin" })
              }
            >
              Try admin demo
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
