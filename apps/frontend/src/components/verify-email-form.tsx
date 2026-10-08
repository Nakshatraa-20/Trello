import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import signupDeskScene from "@/assets/signup-desk-scene.png";
import { Input } from "@/components/ui/input";
import { authRequest, finishSignIn, pendingVerificationEmail, rememberVerificationEmail } from "@/lib/auth";

export function VerifyEmailForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() =>
    typeof location.state?.email === "string" ? location.state.email : pendingVerificationEmail(),
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestRef.current) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit code from your email.");
      return;
    }
    const request = new AbortController();
    requestRef.current = request;
    setIsSubmitting(true);
    setError("");
    const verificationEmail = email.trim();
    rememberVerificationEmail(verificationEmail);
    try {
      const data = await authRequest("/verify-email", { email: verificationEmail, code }, request.signal);
      if (request.signal.aborted) return;
      finishSignIn(data.token);
      navigate("/dashboard", { replace: true });
    } catch (cause) {
      if (!request.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to verify your email.");
    } finally {
      requestRef.current = null;
      if (!request.signal.aborted) setIsSubmitting(false);
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-paper font-handwritten text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-[440px] w-[440px] rounded-full bg-sticky-pink/35 blur-xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-36 h-96 w-96 rounded-full bg-sticky-pink/50 blur-sm" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sticky-green/45 blur-sm" />
      <img aria-hidden="true" src={signupDeskScene} alt="" className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden w-full min-w-[900px] lg:block" />
      <header className="relative mx-auto flex max-w-7xl justify-end px-6 py-8 lg:px-12">
        <Link to="/login" className="border-b-2 border-pink-400 pb-1 text-lg font-bold text-pink-500">Back to sign in</Link>
      </header>
      <main className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-start lg:px-12 lg:pb-56 lg:pt-10">
        <section className="hidden pt-14 lg:block">
          <h1 className="max-w-lg text-5xl font-bold leading-[1.15] tracking-tight xl:text-6xl">One little step<br />to your space. <span className="text-pink-400">♡</span></h1>
          <div className="mt-5 h-1 w-48 -rotate-3 rounded-full bg-[#e7aa9f]" />
          <p className="mt-10 max-w-md text-3xl leading-relaxed text-ink-muted">Your ideas are ready for a home. Let&apos;s make sure it&apos;s yours.</p>
        </section>
        <section aria-labelledby="verification-title" className="relative mx-auto w-full max-w-[560px]">
          <div aria-hidden="true" className="absolute -top-5 left-1/2 z-20 h-11 w-40 -translate-x-1/2 -rotate-6 border border-paper-card/60 opacity-90 shadow-sm" style={{ backgroundColor: "#fff5ed", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px), repeating-linear-gradient(90deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px)" }} />
          <div className="rounded-[2rem] border border-paper-border bg-paper-card/95 px-7 py-12 shadow-[0_18px_50px_rgba(83,65,45,0.16)] sm:px-12 sm:py-14">
            <span aria-hidden="true" className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-sticky-pink/65"><ShieldCheck className="h-8 w-8" /></span>
            <h2 id="verification-title" className="text-4xl font-bold tracking-tight">Check your inbox <span className="text-pink-400">♡</span></h2>
            <p className="mb-8 mt-3 text-xl text-ink-muted">Enter the six-digit code from your verification email to finish creating your account.</p>
            <form onSubmit={verifyEmail} aria-busy={isSubmitting}>
              <fieldset disabled={isSubmitting} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="verification-email" className="block text-xl font-bold">Email</label>
                  <div className="relative">
                    <Mail aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 z-10 h-6 w-6 -translate-y-1/2 text-ink-muted" />
                    <Input id="verification-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="Email used to sign up" className="h-16 rounded-xl border-paper-border bg-paper px-14 font-handwritten text-xl text-ink md:text-xl focus-visible:border-pink-400 focus-visible:ring-pink-300/35" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="verification-code" className="block text-xl font-bold">Verification code</label>
                  <Input id="verification-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} minLength={6} required value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} aria-describedby="code-hint" aria-invalid={Boolean(error)} placeholder="000000" className="h-16 rounded-xl border-paper-border bg-paper px-4 text-center font-handwritten text-3xl tracking-[0.3em] text-ink placeholder:text-ink-muted/40 md:text-3xl focus-visible:border-pink-400 focus-visible:ring-pink-300/35" />
                  <p id="code-hint" className="text-base text-ink-muted">You can paste the full code. It expires 10 minutes after it was sent.</p>
                </div>
                {error && <p role="alert" className="rounded-lg bg-sticky-pink/45 px-4 py-3 text-center text-base text-ink">{error}</p>}
                <button type="submit" className="flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-[#c96f6a] text-2xl font-bold text-paper-card shadow-md transition hover:bg-[#b85c5e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c96f6a] disabled:cursor-wait disabled:opacity-70">
                  {isSubmitting ? "Verifying…" : "Verify & continue"} {!isSubmitting && <ArrowRight aria-hidden="true" className="h-7 w-7" />}
                </button>
              </fieldset>
            </form>
            <p className="mt-7 text-center text-base leading-relaxed text-ink-muted">Can&apos;t find the email? Check your spam folder and make sure the email address above matches the one you registered with.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
