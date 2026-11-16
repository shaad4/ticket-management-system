import { statuses } from "../ticketUtils";

export default function AdminControls({ ticket, users, busy, onChange }) {
  return (
    <section className="admin-controls" aria-label="Admin ticket management">
      <div>
        <p className="eyebrow">ADMIN CONTROLS</p>
        <p className="muted">
          Keep the status current and give this request an owner.
        </p>
      </div>
      <div className="admin-fields">
        <label className="field">
          Status
          <select
            disabled={busy}
            value={ticket.status}
            onChange={(event) => onChange({ status: event.target.value })}
          >
            {Object.entries(statuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Assign to
          <select
            disabled={busy}
            value={ticket.assigned_to ?? ""}
            onChange={(event) =>
              onChange({
                assigned_to: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
          >
            <option value="">Unassigned</option>
            {users.map((person) => (
              <option value={person.id} key={person.id}>
                {person.username}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
