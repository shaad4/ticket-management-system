export const statuses = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
};
export const priorities = { low: "Low", medium: "Medium", high: "High" };

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
