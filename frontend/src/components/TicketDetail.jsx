import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import Badge from "./Badge";
import AdminControls from "./AdminControls";
import { formatDate } from "../ticketUtils";

export default function TicketDetail({
  ticket,
  users,
  isAdmin,
  busy,
  onEdit,
  onDelete,
  onManage,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <section className="panel detail">
      <div className="actions">
        <Badge value={ticket.status} />
        <Badge value={ticket.priority} />
      </div>

      <h2>{ticket.title}</h2>
      <p className="description">{ticket.description}</p>

      <dl className="metadata">
        <div>
          <dt>Created by</dt>
          <dd>{ticket.user_username}</dd>
        </div>
        <div>
          <dt>Assigned to</dt>
          <dd>{ticket.assigned_to_username || "Unassigned"}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(ticket.created_at)}</dd>
        </div>
      </dl>

      {isAdmin && (
        <AdminControls
          ticket={ticket}
          users={users}
          busy={busy}
          onChange={onManage}
        />
      )}

      <div className="actions">
        <button className="btn" onClick={onEdit} disabled={busy}>
          <Pencil size={15} />
          Edit ticket
        </button>
        <button
          className="btn danger"
          onClick={() => setConfirmDelete(true)}
          disabled={busy}
        >
          <Trash2 size={15} />
          Delete ticket
        </button>
      </div>

      {confirmDelete && (
        <div className="delete-confirm" role="alert">
          <strong>Delete ticket #{ticket.id}?</strong>
          <p>This permanently deletes the ticket. This cannot be undone.</p>

          <div className="actions">
            <button className="btn danger" onClick={onDelete} disabled={busy}>
              Yes, delete ticket
            </button>
            <button
              className="btn"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
            >
              Keep ticket
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
