import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { api } from "../api";

export default function Auth({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const username = data.get("username").trim();
    const password = data.get("password");

    setError("");
    setNotice("");

    if (!username) {
      setError("Please enter your username.");
      return;
    }

    if (register && password !== data.get("confirm_password")) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      if (register) {
        await api.register({
          username,
          email: data.get("email").trim(),
          password,
          confirm_password: data.get("confirm_password"),
        });

        setRegister(false);
        setNotice(
          "Account created. Sign in with your new username and password.",
        );
      } else {
        const result = await api.login({ username, password });
        onLogin(result.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
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

        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}

        <form className="form-stack" onSubmit={submit} key={String(register)}>
          <fieldset className="form-stack" disabled={saving}>
            <label className="field">
              Username
              <input
                name="username"
                autoComplete="username"
                required
                maxLength={150}
              />
            </label>

            {register && (
              <label className="field">
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
            )}

            <label className="field">
              Password
              <input
                name="password"
                type="password"
                minLength={register ? 8 : undefined}
                autoComplete={register ? "new-password" : "current-password"}
                required
              />
            </label>

            {register && (
              <label className="field">
                Confirm password
                <input
                  name="confirm_password"
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
              {saving
                ? "Please wait…"
                : register
                  ? "Create account"
                  : "Sign in"}
              <ArrowRight size={16} />
            </button>
          </fieldset>
        </form>

        <p className="auth-switch muted">
          {register ? "Already have an account?" : "New here?"}{" "}
          <button
            disabled={saving}
            onClick={() => {
              setRegister(!register);
              setError("");
              setNotice("");
            }}
          >
            {register ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}
