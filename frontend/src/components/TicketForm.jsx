import { useState } from "react";
import { Spinner } from "./Loading";
import { priorities } from "../ticketUtils";

export default function TicketForm({ ticket, busy, onSave, onCancel }) {
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (busy) return;

    const data = new FormData(event.currentTarget);
    const title = data.get("title").trim();
    const description = data.get("description").trim();

    setError("");

    if (!title || !description) {
      setError("Please add a title and description, not just spaces.");
      return;
    }

    onSave({ title, description, priority: data.get("priority") });
  }

  const submitLabel = busy
    ? ticket ? "Saving changes…" : "Creating ticket…"
    : ticket ? "Save changes" : "Create ticket";

  return (
    <section className="panel editor">
      <h2>{ticket ? "Edit ticket" : "Tell us what happened"}</h2>
      <p className="muted">A few details help us find the right solution.</p>

      <form onSubmit={submit} aria-busy={busy}>
        <fieldset className="form-stack" disabled={busy}>
          <label className="field">
            Title
            <input
              name="title"
              defaultValue={ticket?.title}
              placeholder="A short summary of the issue"
              required
              maxLength={200}
              autoFocus
            />
          </label>

          <label className="field">
            Description
            <textarea
              name="description"
              defaultValue={ticket?.description}
              placeholder="What were you trying to do? What happened instead?"
              required
            />
          </label>

          <label className="field">
            Priority
            <select name="priority" defaultValue={ticket?.priority || "medium"}>
              {Object.entries(priorities).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="actions">
            <button className="btn primary" type="submit">
              {busy && <Spinner />}
              {submitLabel}
            </button>
            <button className="btn" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
