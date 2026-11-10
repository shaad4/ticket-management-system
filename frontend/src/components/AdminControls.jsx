import { statuses } from './Badge'
import { people } from '../data'
export default function AdminControls({ ticket, user, onChange }) {
  const assignees = people.some(person => person.id === user.id) ? people : [...people, user]
  return <section className="admin-controls" aria-label="Admin ticket management"><div><p className="eyebrow">ADMIN CONTROLS</p><p className="muted">Keep the status current and give this request an owner.</p></div><div className="admin-fields"><label className="field">Status<select value={ticket.status} onChange={event => onChange({ status: event.target.value })}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field">Assign to<select value={ticket.assigned_to} onChange={event => onChange({ assigned_to: event.target.value })}><option value="">Unassigned</option>{assignees.map(person => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label></div></section>
}
