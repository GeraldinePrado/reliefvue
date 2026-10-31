import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Check, Copy, Loader2, X } from "lucide-react";
import mark from "../assets/reliefvue-mark.png";

/* ------------------------------------------------------------------ toast */

type Tone = "info" | "success" | "error";

interface ToastEntry {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastValue {
  push: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastEntry[]>([]);
  const counter = useRef(0);

  const push = useCallback((message: string, tone: Tone = "info") => {
    counter.current += 1;
    const id = counter.current;
    setMessages((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setMessages((current) => current.filter((entry) => entry.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {messages.map((entry) => (
          <div key={entry.id} className={`toast toast-${entry.tone}`}>
            <span className="toast-dot" aria-hidden="true" />
            <span>{entry.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}

/* ---------------------------------------------------------------- controls */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 className="spin" size={16} aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  optional,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: (id: string) => ReactNode;
  optional?: boolean;
}) {
  const id = useId();
  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      <label className="field-label" htmlFor={id}>
        {label}
        {optional ? <span className="field-optional">Optional</span> : null}
      </label>
      {children(id)}
      {error ? <p className="field-hint field-hint-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`input select ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`input textarea ${className}`} {...rest} />;
}

/* ------------------------------------------------------------------ badges */

const TONE: Record<string, string> = {
  submitted: "amber",
  needs_info: "coral",
  approved: "violet",
  rejected: "neutral",
  paid: "green",
  awaiting_approvals: "violet",
  sent: "green",
  active: "green",
  draft: "neutral",
  closed: "neutral",
  verified: "green",
  pending: "amber",
  unverified: "neutral",
};

const LABEL: Record<string, string> = {
  submitted: "Under review",
  needs_info: "Needs information",
  approved: "Awaiting signatures",
  rejected: "Not approved",
  paid: "Paid",
  awaiting_approvals: "Awaiting signatures",
  sent: "Sent",
  active: "Active",
  draft: "Draft",
  closed: "Closed",
  verified: "Verified",
  pending: "Pending",
  unverified: "Unverified",
};

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`badge badge-${TONE[value] ?? "neutral"}`}>
      <span className="badge-dot" aria-hidden="true" />
      {label ?? LABEL[value] ?? value}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "violet" | "green" | "coral" | "amber";
  icon?: ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

export function Flag({ children }: { children: ReactNode }) {
  return <span className="flag">{children}</span>;
}

/* ------------------------------------------------------------------ layout */

export function SectionHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="section-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {actions ? <div className="section-actions">{actions}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "plain",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "plain" | "accent" | "muted";
}) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {sub ? <span className="stat-sub">{sub}</span> : null}
    </div>
  );
}

export function Progress({
  value,
  max,
  label,
  tone = "violet",
}: {
  value: number;
  max: number;
  label?: string;
  tone?: "violet" | "green" | "coral";
}) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`progress progress-${tone}`} role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="spinner-wrap" role="status">
      <Loader2 className="spin" size={20} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-icon">{icon}</div> : null}
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ modal */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal modal-${size}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </dialog>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("drawer-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("drawer-open");
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="drawer-layer" role="presentation">
      <button type="button" className="drawer-scrim" aria-label="Close panel" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : "Details"}>
        <header className="drawer-head">
          <div>
            <div className="drawer-title">{title}</div>
            {subtitle ? <div className="drawer-subtitle">{subtitle}</div> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
            <X size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer ? <footer className="drawer-footer">{footer}</footer> : null}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ misc */

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      aria-label={`${label}: ${value}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <span className={`logo ${light ? "logo-light" : ""} ${compact ? "logo-compact" : ""}`}>
      <img src={mark} alt="" width={compact ? 30 : 38} height={compact ? 30 : 38} />
      {compact ? null : <span className="logo-word">ReliefVue</span>}
    </span>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span className={`avatar avatar-${size}`} aria-hidden="true">
      {letters || "R"}
    </span>
  );
}

export function InfoNote({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" | "demo" }) {
  return <div className={`info-note info-note-${tone}`}>{children}</div>;
}
