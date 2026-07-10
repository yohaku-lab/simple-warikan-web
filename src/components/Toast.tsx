import { CheckCircleIcon } from "./icons";

export function Toast({ message }: { message: string }) {
  return (
    <div className="toast-overlay">
      <div className="toast-card">
        <CheckCircleIcon />
        <span>{message}</span>
      </div>
    </div>
  );
}
