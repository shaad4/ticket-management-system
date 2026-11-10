import { useState } from "react";
import {
  ArrowUpRight,
  Search,
  Ticket,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Badge from "./Badge";
import { statuses, priorities, formatDate } from "../ticketUtils";

export default function TicketList({
  tickets,
  users,
  isAdmin,
  busy,
  onOpen,
  filters,
  pagination,
  onFilterChange,
  onPageChange,
}) {
  const [query, setQuery] = useState("");

  const hasFilters = Boolean(
    filters.status || filters.priority || filters.user,
  );
  const filtered = tickets.filter((ticket) =>
    `${ticket.title} ${ticket.id}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <p className="eyebrow">ON THIS PAGE</p>
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
            <span className="count">{pagination.count}</span>
          </h2>
          <span className="muted">Made for moving forward.</span>
        </div>
        <div className="filters">
          <label className="search-wrap">
            <Search size={17} />
            <input
              className="search"
              aria-label="Search tickets on this page"
              placeholder="Search this page…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="field">
            <span className="sr-only">Filter by status</span>
            <select
              value={filters.status}
              onChange={(event) =>
                onFilterChange({ status: event.target.value })
              }
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
              value={filters.priority}
              onChange={(event) =>
                onFilterChange({ priority: event.target.value })
              }
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
            <label className="field creator-filter">
              <span className="sr-only">Filter by creator</span>
              <select
                value={filters.user}
                onChange={(event) =>
                  onFilterChange({ user: event.target.value })
                }
              >
                <option value="">All creators</option>
                {users.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.username}
                  </option>
                ))}
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
                <tr
                  key={ticket.id}
                  className="ticket-row"
                  aria-disabled={busy}
                  onClick={() => {
                    if (!busy) onOpen(ticket.id);
                  }}
                >
                  <td>
                    <button
                      className="ticket-link"
                      disabled={busy}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpen(ticket.id);
                      }}
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
        <ul className="mobile-ticket-list" aria-label="Ticket list">
          {filtered.map((ticket) => (
            <li key={ticket.id}>
              <button
                className="mobile-ticket-card"
                disabled={busy}
                onClick={() => onOpen(ticket.id)}
              >
                <span className="mobile-ticket-heading">
                  <span className="ticket-id">#{ticket.id}</span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>

                <strong className="mobile-ticket-title">{ticket.title}</strong>

                <span className="mobile-ticket-badges">
                  <Badge value={ticket.status} />
                  <Badge value={ticket.priority} />
                </span>

                <span className="mobile-ticket-meta">
                  {isAdmin && <span>By {ticket.user_username}</span>}
                  <span>Created {formatDate(ticket.created_at)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {!filtered.length && (
          <div className="empty">
            <Inbox size={30} />
            <h2>
              {query || hasFilters ? "No matching tickets" : "A clean slate"}
            </h2>
            <p className="muted">
              {query || hasFilters
                ? "Try another search on this page or clear your filters."
                : "Create your first ticket whenever you need a hand."}
            </p>
            {(query || hasFilters) && (
              <button
                className="btn"
                onClick={() => {
                  setQuery("");
                  onFilterChange({ status: "", priority: "", user: "" });
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        <div className="list-footer pagination-footer">
          <span role="status">
            {filtered.length} of {tickets.length} tickets on this page ·{" "}
            {pagination.count} total
          </span>

          <nav className="actions" aria-label="Ticket pages">
            <button
              className="btn"
              disabled={busy || !pagination.previous}
              onClick={() => onPageChange(filters.page - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span aria-current="page">Page {filters.page}</span>

            <button
              className="btn"
              disabled={busy || !pagination.next}
              onClick={() => onPageChange(filters.page + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      </section>
    </>
  );
}
