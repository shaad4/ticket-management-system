export const statuses = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
};
export const priorities = { low: "Low", medium: "Medium", high: "High" };

export const people = [
  { id: "1", name: "Alex Morgan" },
  { id: "2", name: "Jamie Park" },
  { id: "admin", name: "Sam Chen" },
];
export const initialTickets = [
  {
    id: 1048,
    title: "Unable to access the shared workspace",
    description:
      "The shared workspace shows an access denied message after signing in. Please help restore access.",
    priority: "high",
    status: "open",
    user: "1",
    assigned_to: "",
    created_at: "2026-11-10T09:20:00",
  },
  {
    id: 1047,
    title: "Exported report is missing a column",
    description:
      "The monthly report export does not include the department column. It is visible in the preview.",
    priority: "medium",
    status: "in-progress",
    user: "1",
    assigned_to: "admin",
    created_at: "2026-11-09T14:30:00",
  },
  {
    id: 1046,
    title: "Update my account display name",
    description: "Please update my display name to match my profile.",
    priority: "low",
    status: "resolved",
    user: "1",
    assigned_to: "admin",
    created_at: "2026-11-08T10:00:00",
  },
  {
    id: 1045,
    title: "Notifications arriving twice",
    description: "I receive two email notifications for every ticket update.",
    priority: "medium",
    status: "open",
    user: "2",
    assigned_to: "",
    created_at: "2026-11-07T11:15:00",
  },
];
export function personName(id, users) {
  return users.find((person) => person.id === id)?.name || "Unassigned";
}
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
