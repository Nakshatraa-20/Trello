import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authRequest, finishSignIn } from "@/lib/auth";
import { loadGoogleIdentity, registerGoogleCredentialHandler } from "@/lib/google-identity";

export function GoogleSignInButton({ disabled = false, onBusyChange }: {
  disabled?: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const disabledRef = useRef(disabled);
  const navigate = useNavigate();
  const [retry, setRetry] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => { disabledRef.current = disabled; }, [disabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!clientId || !container) return;
    let active = true;
    let submitting = false;
    let unregister: (() => void) | undefined;
    let observer: ResizeObserver | undefined;
    const request = new AbortController();

    loadGoogleIdentity().then((identity) => {
      if (!active) return;
      unregister = registerGoogleCredentialHandler(identity, clientId, async (response) => {
        if (!active || submitting || disabledRef.current) return;
        submitting = true;
        setBusy(true);
        setError("");
        onBusyChange(true);
        try {
          if (!response.credential) throw new Error("Google did not return a sign-in credential. Please try again.");
          const data = await authRequest("/google", { credential: response.credential }, request.signal);
          if (!active) return;
          finishSignIn(data.token);
          navigate("/dashboard", { replace: true });
        } catch (cause) {
          if (active) setError(cause instanceof Error ? cause.message : "Unable to sign in with Google.");
        } finally {
          submitting = false;
          if (active) { setBusy(false); onBusyChange(false); }
        }
      });
      let previousWidth = 0;
      const render = () => {
        if (!active) return;
        const width = Math.max(200, Math.min(400, Math.floor(container.clientWidth)));
        if (width === previousWidth) return;
        previousWidth = width;
        container.replaceChildren();
        identity.renderButton(container, {
          type: "standard", theme: "outline", size: "large",
          text: "continue_with", shape: "pill", width,
        });
      };
      render();
      observer = new ResizeObserver(render);
      observer.observe(container);
      setReady(true);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Google sign-in could not load.");
    });

    return () => {
      active = false;
      request.abort();
      observer?.disconnect();
      unregister?.();
      container.replaceChildren();
      onBusyChange(false);
    };
  }, [clientId, navigate, onBusyChange, retry]);

  return (
    <div className="mt-7 space-y-4">
      <div aria-hidden="true" className="flex items-center gap-4 text-base text-ink-muted">
        <span className="h-px flex-1 bg-paper-border" />or<span className="h-px flex-1 bg-paper-border" />
      </div>
      {!clientId && <p className="text-center text-base text-ink-muted">Google sign-in isn&apos;t available right now.</p>}
      {clientId && !ready && !error && <p role="status" className="text-center text-base text-ink-muted">Loading Google sign-in…</p>}
      <div inert={disabled || busy} className={disabled || busy ? "opacity-60" : ""}>
        <div ref={containerRef} className="mx-auto flex min-h-10 w-full max-w-[400px] justify-center" />
      </div>
      {busy && <p role="status" className="text-center text-base text-ink-muted">Signing in with Google…</p>}
      {error && (
        <div className="rounded-lg bg-sticky-pink/45 px-4 py-3 text-center text-base text-ink">
          <p role="alert">{error}</p>
          {!ready && <button type="button" disabled={disabled} onClick={() => { setError(""); setRetry((value) => value + 1); }} className="mt-2 font-bold underline underline-offset-4 disabled:opacity-50">Try again</button>}
        </div>
      )}
    </div>
  );
}
