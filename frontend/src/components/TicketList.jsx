import { useState } from "react";
import { ArrowUpRight, Search, Ticket, Inbox } from "lucide-react";

import Badge from "./Badge";
import { statuses, priorities, formatDate } from "../ticketUtils";

export default function TicketList({ tickets, users, isAdmin, busy, onOpen }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [owner, setOwner] = useState("");

  const filtered = tickets.filter((ticket) => {
    const matchesOwner = !owner || String(ticket.user) === owner;
    const matchesStatus = !status || ticket.status === status;
    const matchesPriority = !priority || ticket.priority === priority;
    const matchesSearch = `${ticket.title} ${ticket.id}`
      .toLowerCase()
      .includes(query.toLowerCase());

    return matchesOwner && matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <>
      <div className="stats">
        {Object.entries(statuses).map(([value, label]) => (
          <div className="panel stat" key={value}>
            <span className={`stat-icon ${value}`}>
              <Ticket size={19} />
            </span>
            <div>
              <p>{label}</p>
              <strong>
                {tickets.filter((ticket) => ticket.status === value).length}
              </strong>
            </div>
          </div>
        ))}
      </div>
      <section className="panel ticket-list" aria-label="Tickets">
        <div className="list-heading">
          <h2>
            {isAdmin ? "Team requests" : "Your requests"}{" "}
            <span className="count">{tickets.length}</span>
          </h2>
          <span className="muted">Made for moving forward.</span>
        </div>
        <div className="filters">
          <label className="search-wrap">
            <Search size={17} />
            <input
              className="search"
              aria-label="Search tickets"
              placeholder="Search by title or ticket number…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="field">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              {Object.entries(statuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="sr-only">Filter by priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="">All priorities</option>
              {Object.entries(priorities).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {isAdmin && (
            <label className="field">
              <span className="sr-only">Filter by creator</span>
              <select
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
              >
                <option value="">All creators</option>
                {[...new Set(tickets.map((ticket) => ticket.user))].map(
                  (id) => (
                    <option key={id} value={id}>
                      {users.find((person) => person.id === id)?.username ||
                        `User #${id}`}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                {isAdmin && <th>Creator</th>}
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>
                  <span className="sr-only">Open ticket</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <button
                      className="ticket-link"
                      disabled={busy}
                      onClick={() => onOpen(ticket.id)}
                    >
                      <span className="ticket-id">#{ticket.id}</span>
                      <strong>{ticket.title}</strong>
                    </button>
                  </td>
                  {isAdmin && <td className="date">{ticket.user_username}</td>}
                  <td>
                    <Badge value={ticket.status} />
                  </td>
                  <td>
                    <Badge value={ticket.priority} />
                  </td>
                  <td className="date">{formatDate(ticket.created_at)}</td>
                  <td>
                    <ArrowUpRight
                      size={16}
                      className="muted"
                      aria-hidden="true"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="empty">
            <Inbox size={30} />
            <h2>{tickets.length ? "No matching tickets" : "A clean slate"}</h2>
            <p className="muted">
              {tickets.length
                ? "Try another search or clear your filters."
                : "Create your first ticket whenever you need a hand."}
            </p>
            {tickets.length > 0 && (
              <button
                className="btn"
                onClick={() => {
                  setQuery("");
                  setStatus("");
                  setPriority("");
                  setOwner("");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        <div className="list-footer">
          {filtered.length} {filtered.length === 1 ? "ticket" : "tickets"} ·
          Saved to your workspace
        </div>
      </section>
    </>
  );
}
