import {
  Circle,
  CircleDashed,
  CircleCheck,
  ArrowDown,
  Minus,
  ArrowUp,
} from "lucide-react";
import { statuses, priorities } from "../ticketUtils";
const icons = {
  open: Circle,
  "in-progress": CircleDashed,
  resolved: CircleCheck,
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
};

export default function Badge({ value }) {
  const Icon = icons[value];

  return (
    <span className={`badge ${value}`}>
      <Icon size={13} strokeWidth={2} />
      {statuses[value] || priorities[value]}
    </span>
  );
}
