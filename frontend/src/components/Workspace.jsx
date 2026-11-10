import { useEffect, useState } from "react";
import { Plus, ArrowLeft, RefreshCw } from "lucide-react";

import { api } from "../api";
import TicketList from "./TicketList";
import TicketDetail from "./TicketDetail";
import TicketForm from "./TicketForm";

export default function Workspace({ user, onSessionExpired }) {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    status: "",
    priority: "",
    user: "",
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);

  const isAdmin = user.is_staff;

  useEffect(() => {
    if (view !== "list") return;

    const controller = new AbortController();

    async function loadWorkspace() {
      setLoading(true);
      setLoadFailed(false);
      setError("");

      try {
        const [ticketList, userList] = await Promise.all([
          api.tickets(filters, controller.signal),
          isAdmin ? api.users(controller.signal) : Promise.resolve([]),
        ]);

        if (controller.signal.aborted) return;

        setTickets(ticketList.results);
        setPagination({
          count: ticketList.count,
          next: ticketList.next,
          previous: ticketList.previous,
        });
        setUsers(userList);
      } catch (error) {
        if (error.name === "AbortError") return;
        // A deletion in another session can make the current page disappear.
        if (error.status === 404 && filters.page > 1) {
          setFilters((current) => ({ ...current, page: 1 }));
          return;
        }

        setLoadFailed(true);
        if (error.sessionExpired) onSessionExpired();
        else setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadWorkspace();

    return () => controller.abort();
  }, [isAdmin, onSessionExpired, refresh, filters, view]);

  function showError(error) {
    if (error.sessionExpired) onSessionExpired();
    else setError(error.message);
  }

  function changeFilters(values) {
    setLoading(true);
    setFilters((current) => ({ ...current, ...values, page: 1 }));
  }

  function changePage(page) {
    setLoading(true);
    setFilters((current) => ({ ...current, page }));
  }

  function back() {
    setLoading(true);
    setView("list");
    setError("");
    setNotice("");
  }

  async function openTicket(id) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const ticket = await api.ticket(id);
      setSelected(ticket);
      setView("detail");
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  async function save(fields) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (view === "edit") {
        setSelected(await api.updateTicket(selected.id, fields));
        setNotice("Ticket updated.");
      } else {
        const ticket = await api.createTicket(fields);
        setFilters((current) => ({ ...current, page: 1 }));
        setSelected(ticket);
        setNotice("Ticket created. We’ll take it from here.");
      }

      setView("detail");
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  async function updateManagement(fields) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      setSelected(await api.updateTicket(selected.id, fields));
      setNotice("Ticket management updated.");
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  async function deleteTicket() {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await api.deleteTicket(selected.id);
      if (tickets.length === 1 && filters.page > 1) {
        setFilters((current) => ({ ...current, page: current.page - 1 }));
      }

      setLoading(true);
      setSelected(null);
      setView("list");
      setNotice("Ticket deleted.");
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  let title = isAdmin ? "All tickets" : "My tickets";
  if (view === "new") title = "Create a ticket";
  if (view === "detail" || view === "edit") title = `Ticket #${selected.id}`;

  return (
    <main>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {isAdmin ? "ADMIN WORKSPACE" : "YOUR WORKSPACE"}
          </p>
          <h1>{title}</h1>
          <p className="muted">
            {isAdmin
              ? "Keep every request moving. One team, one clear view."
              : "A clear view of your requests, from start to solved."}
          </p>
        </div>

        {view === "list" ? (
          <div className="actions">
            <button
              className="btn"
              disabled={loading || busy}
              onClick={() => setRefresh(refresh + 1)}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              className="btn primary"
              disabled={loading || busy}
              onClick={() => {
                setView("new");
                setError("");
                setNotice("");
              }}
            >
              <Plus size={17} />
              New ticket
            </button>
          </div>
        ) : (
          <button className="btn" onClick={back} disabled={busy}>
            <ArrowLeft size={16} />
            All tickets
          </button>
        )}
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div role="status" className={notice ? "notice" : ""}>
        {notice}
      </div>
      {busy && (
        <p className="muted" role="status">
          Please wait…
        </p>
      )}

      {view === "list" && loading ? (
        <p className="muted" role="status">
          Loading tickets…
        </p>
      ) : view === "list" && loadFailed ? (
        <p className="muted">
          Tickets could not be loaded. Use Refresh to try again.
        </p>
      ) : view === "list" ? (
        <TicketList
          tickets={tickets}
          users={users}
          isAdmin={isAdmin}
          busy={busy}
          onOpen={openTicket}
          filters={filters}
          pagination={pagination}
          onFilterChange={changeFilters}
          onPageChange={changePage}
        />
      ) : view === "new" || view === "edit" ? (
        <TicketForm
          ticket={view === "edit" ? selected : null}
          busy={busy}
          onSave={save}
          onCancel={() => {
            if (view === "new") setLoading(true);
            setView(view === "edit" ? "detail" : "list");
            setError("");
          }}
        />
      ) : (
        <TicketDetail
          ticket={selected}
          users={users}
          isAdmin={isAdmin}
          busy={busy}
          onEdit={() => {
            setView("edit");
            setError("");
            setNotice("");
          }}
          onDelete={deleteTicket}
          onManage={updateManagement}
        />
      )}

      <footer>
        Ticket Desk <span>Thoughtfully simple support.</span>
      </footer>
    </main>
  );
}
