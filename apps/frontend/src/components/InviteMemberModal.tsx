import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Mail, Send, UsersRound, X } from "lucide-react";
import { API_URL } from "../config";

export function PaperDialog({
  title,
  description,
  children,
  onClose,
  busy = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-paper-border bg-paper-card p-0 font-handwritten text-ink shadow-2xl backdrop:bg-[#382f27]/30 backdrop:backdrop-blur-sm"
    >
      <div className="relative px-6 py-8 sm:px-9 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-3 w-20 -translate-x-1/2 bg-[#e8c790]/65"
        />
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close dialog"
          className="absolute right-3 top-3 rounded-full p-2 text-ink-muted transition hover:bg-paper-dark focus-visible:outline-2 focus-visible:outline-[#c96f6a] disabled:opacity-40"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id={titleId} className="pr-6 text-3xl font-bold">
          {title}
        </h2>
        <p
          id={descriptionId}
          className="mb-7 mt-2 text-lg leading-relaxed text-ink-muted"
        >
          {description}
        </p>
        {children}
      </div>
    </dialog>
  );
}

type Props = {
  orgId: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function InviteMemberModal({
  onClose,
  orgId,
  onSuccess,
}: Props) {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = identifier.trim();
    if (!value || requestRef.current) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in again to invite someone.");
      return;
    }
    const request = new AbortController();
    requestRef.current = request;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/invitation/${orgId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          value.includes("@") ? { email: value } : { username: value },
        ),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message ||
            "The invitation could not be sent. Please try again.",
        );
      if (request.signal.aborted) return;
      onSuccess?.();
      onClose();
    } catch (cause) {
      if (!request.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to send the invitation.",
        );
    } finally {
      requestRef.current = null;
      if (!request.signal.aborted) setSending(false);
    }
  }

  return (
    <PaperDialog
      title="Good ideas love company."
      description="Invite someone to share this workspace and bring your projects to life."
      onClose={onClose}
      busy={sending}
    >
      <form onSubmit={handleInvite} aria-busy={sending}>
        <fieldset disabled={sending} className="space-y-5">
          <label htmlFor="workspace-invite" className="block text-xl font-bold">
            Username or email
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
            />
            <input
              id="workspace-invite"
              autoFocus
              required
              autoComplete="off"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Your teammate’s username or email"
              className="h-14 w-full rounded-xl border border-paper-border bg-paper pl-12 pr-4 text-lg outline-none placeholder:text-ink-muted/60 focus:border-[#c96f6a] focus:ring-2 focus:ring-sticky-pink/40"
            />
          </div>
          <p className="flex items-center gap-2 text-base text-ink-muted">
            <UsersRound aria-hidden="true" className="h-4 w-4 shrink-0" />
            They’ll be invited as a workspace member.
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-sticky-pink/35 px-4 py-3 text-base"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="flex h-13 w-full items-center justify-center gap-3 rounded-lg bg-[#c96f6a] text-xl font-bold text-paper-card shadow-sm transition hover:bg-[#b85c5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c96f6a] disabled:cursor-wait disabled:opacity-60"
          >
            {sending ? "Sending invitation…" : "Send invitation"}
            <Send aria-hidden="true" className="h-5 w-5" />
          </button>
        </fieldset>
      </form>
    </PaperDialog>
  );
}
