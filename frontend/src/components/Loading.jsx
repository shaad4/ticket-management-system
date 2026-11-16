import { LoaderCircle } from "lucide-react";

export function Spinner() {
  return <LoaderCircle className="spinner" size={16} aria-hidden="true" />;
}

export default function Loading({ children, skeleton = false }) {
  return (
    <div className={skeleton ? "panel loading-panel" : "loading-status"}>
      <p className="loading-message" role="status">
        <Spinner />
        {children}
      </p>

      {skeleton && (
        <div className="loading-skeleton" aria-hidden="true">
          {[1, 2, 3].map((row) => (
            <div className="skeleton-row" key={row}>
              <span className="skeleton-line" />
              <span className="skeleton-line short" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
