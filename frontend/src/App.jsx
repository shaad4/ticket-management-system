import { useState } from 'react'
import { Ticket, LogOut } from 'lucide-react'
import Auth from './components/Auth'
export default function App() {
  const [user, setUser] = useState(null)
  return <div className="app"><header><div className="brand"><span className="brand-icon"><Ticket size={21}/></span>Ticket Desk</div><div className="actions"><span className="demo-label">LOCAL DEMO</span>{user && <button className="btn quiet" onClick={() => setUser(null)}><LogOut size={16}/>Sign out</button>}</div></header>{user ? <main><p className="eyebrow">{user.role === 'admin' ? 'ADMIN WORKSPACE' : 'YOUR WORKSPACE'}</p><h1>Welcome, {user.name.split(' ')[0]}.</h1><p className="muted">Your tickets will appear here.</p></main> : <Auth onLogin={setUser}/>}</div>
}
