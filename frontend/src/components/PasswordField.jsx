import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  label,
  name,
  autoComplete,
  minLength,
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      <div className="password-input">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />

        <button
          className="password-toggle"
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-controls={id}
          onClick={() => setVisible(!visible)}
        >
          <Icon size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
