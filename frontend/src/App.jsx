import { useState } from "react";
import { Ticket, LogOut } from "lucide-react";
import Auth from "./components/Auth";
import Workspace from "./components/Workspace";
import { initialTickets, people } from "./data";
export default function App() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState(initialTickets);
  const [users, setUsers] = useState(people);
  function login(account) {
    setUser(account);
    setUsers((current) =>
      current.some((person) => person.id === account.id)
        ? current
        : [...current, account],
    );
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
        <div className="actions">
          <span className="demo-label">LOCAL DEMO</span>
          {user && (
            <button className="btn quiet" onClick={() => setUser(null)}>
              <LogOut size={16} />
              Sign out
            </button>
          )}
        </div>
      </header>
      {user ? (
        <Workspace
          key={user.id}
          user={user}
          users={users}
          tickets={tickets}
          setTickets={setTickets}
        />
      ) : (
        <Auth onLogin={login} />
      )}
    </div>
  );
}
