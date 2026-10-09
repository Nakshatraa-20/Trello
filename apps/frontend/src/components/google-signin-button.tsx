import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authRequest, finishSignIn } from "@/lib/auth";

type GoogleSignInButtonProps = {
  disabled?: boolean;
  onBusyChange: (busy: boolean) => void;
};

export function GoogleSignInButton({
  disabled = false,
  onBusyChange,
}: GoogleSignInButtonProps) {
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(240);

  useEffect(() => {
    const container = buttonContainerRef.current;
    if (!container) return;
    const resize = () => {
      const width = Math.floor(container.getBoundingClientRect().width);
      if (width > 0) setButtonWidth(Math.min(350, width));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  async function handleGoogleSuccess(response: {
    credential?: string;
  }) {
    if (disabled || busy) return;

    setError("");
    setBusy(true);
    onBusyChange(true);

    try {
      if (!response.credential) {
        throw new Error("Google credential missing");
      }

      // Send Google ID token to Express backend
      const data = await authRequest("/google", {
        credential: response.credential,
      });

      // Store your application's JWT
      finishSignIn(data.token);

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google login failed"
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-4 text-base text-ink-muted">
        <span className="h-px flex-1 bg-paper-border" />
        or
        <span className="h-px flex-1 bg-paper-border" />
      </div>

      <div
        ref={buttonContainerRef}
        className={`mx-auto flex w-full min-w-0 max-w-[350px] justify-center ${
          disabled || busy
            ? "pointer-events-none opacity-60"
            : ""
        }`}
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            setError("Google authentication failed");
          }}
          theme="outline"
          size="large"
          shape="pill"
          text="continue_with"
          width={String(buttonWidth)}
        />
      </div>

      {busy && (
        <p className="text-center text-ink-muted">
          Signing in with Google...
        </p>
      )}

      {error && (
        <p className="text-center text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
