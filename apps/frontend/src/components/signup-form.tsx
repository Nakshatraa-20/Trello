import { type ComponentProps, type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Heart, LockKeyhole, Mail, Sparkles, Star, UserRound, UsersRound } from "lucide-react";

import signupDeskScene from "@/assets/signup-desk-scene.png";
import { Input } from "@/components/ui/input";
import { GoogleSignInButton } from "./google-signin-button";
import { authRequest, rememberVerificationEmail } from "@/lib/auth";

export function SignupForm({ className = "", ...props }: ComponentProps<"div">) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const busy = isSubmitting || googleBusy;
  useEffect(() => () => requestRef.current?.abort(), []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (requestRef.current || googleBusy) return;
    const request = new AbortController();
    requestRef.current = request;
    setError("");
    setIsSubmitting(true);
    const email = emailRef.current?.value.trim() ?? "";

    try {
      await authRequest("/signup", {
        username: usernameRef.current?.value.trim() ?? "",
        email,
        password: passwordRef.current?.value ?? "",
      }, request.signal);
      if (request.signal.aborted) return;
      rememberVerificationEmail(email);
      navigate("/verify-email", { state: { email } });
    } catch (cause) {
      if (!request.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to create your account.");
    } finally {
      requestRef.current = null;
      if (!request.signal.aborted) setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`relative min-h-dvh overflow-x-clip bg-paper font-handwritten text-ink ${className}`}
      {...props}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-[440px] w-[440px] rounded-full bg-sticky-pink/35 blur-xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-36 h-96 w-96 rounded-full bg-sticky-pink/50 blur-sm" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sticky-green/45 blur-sm" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-tl-[12rem] bg-sticky-green/35" />
      <img
        aria-hidden="true"
        src={signupDeskScene}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 z-0 hidden w-full min-w-[900px] lg:block"
      />

      <header className="relative z-10 mx-auto flex min-h-12 max-w-6xl items-center justify-end px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-base leading-6 text-ink-muted">
          Already have an account?{" "}
          <Link to="/login" className="ml-1 border-b-2 border-pink-400 pb-1 font-bold text-pink-500">
            Sign in
          </Link>
        </p>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-3rem)] max-w-6xl content-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-start lg:gap-12 lg:px-8">
        <section className="relative hidden flex-col lg:flex lg:pt-6">
          <svg aria-hidden="true" className="absolute left-0 -top-4 h-12 w-20 text-ink" viewBox="0 0 112 80" fill="none">
            <path d="M11 45L34 50M15 29L34 40M37 16L43 37" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M84 8L88 22L100 27L88 32L84 47L80 32L68 27L80 22L84 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <h1 className="max-w-md font-handwritten text-5xl font-bold leading-[1.15] tracking-tight xl:text-6xl">
            Let&apos;s create<br />your space. <span className="text-pink-400">♡</span>
          </h1>
          <div className="mt-5 h-1 w-48 -rotate-3 rounded-full bg-[#e7aa9f]" />
          <p className="mt-6 max-w-md text-2xl leading-relaxed text-ink-muted">
            A space for your ideas, projects, and everything in between.
          </p>

          <div className="mt-7 space-y-4 text-xl leading-6 text-ink-muted">
            <div className="flex items-center gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sticky-pink text-ink"><Star className="h-7 w-7" /></span>
              <span>Keep track<br />of what matters</span>
            </div>
            <div className="flex items-center gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sticky-green text-ink"><UsersRound className="h-7 w-7" /></span>
              <span>Collaborate<br />with your people</span>
            </div>
            <div className="flex items-center gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sticky-yellow text-ink"><Heart className="h-7 w-7" /></span>
              <span>Turn ideas<br />into real progress</span>
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[500px] lg:justify-self-end">
          <div aria-hidden="true" className="absolute -top-4 left-1/2 z-20 h-8 w-32 -translate-x-1/2 -rotate-6 border border-paper-card/60 opacity-90 shadow-sm" style={{ backgroundColor: "#fff5ed", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px), repeating-linear-gradient(90deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px)" }} />
          <div aria-hidden="true" className="absolute -left-12 top-0 hidden h-12 w-10 text-ink lg:block">
            <Sparkles className="h-10 w-10" strokeWidth={1.7} />
          </div>

          <div className="rounded-[2rem] border border-paper-border bg-paper-card/95 px-5 py-6 shadow-[0_18px_50px_rgba(83,65,45,0.16)] sm:px-8">
            <div className="mb-5">
              <h2 className="font-handwritten text-3xl font-bold leading-tight tracking-tight sm:text-[2rem]">
                Create your account <span className="text-pink-400">♡</span>
              </h2>
              <p className="mt-1.5 text-lg leading-6 text-ink-muted">Join and start organising your boards.</p>
            </div>

            <form onSubmit={handleSubmit} aria-busy={busy}>
              <fieldset disabled={busy} className="space-y-3">
              <label className="block space-y-1 text-lg font-bold leading-6">
                <span>Username</span>
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-muted" />
                  <Input ref={usernameRef} id="username" name="username" autoComplete="username" minLength={3} type="text" placeholder="Choose a username" required className="h-12 rounded-xl border-paper-border bg-paper pl-12 pr-4 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/70 md:text-xl focus-visible:border-pink-400 focus-visible:ring-pink-300/35" />
                </span>
              </label>

              <label className="block space-y-1 text-lg font-bold leading-6">
                <span>Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-muted" />
                  <Input ref={emailRef} id="email" name="email" autoComplete="email" type="email" placeholder="Enter your email" required className="h-12 rounded-xl border-paper-border bg-paper pl-12 pr-4 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/70 md:text-xl focus-visible:border-pink-400 focus-visible:ring-pink-300/35" />
                </span>
              </label>

              <label className="block space-y-1 text-lg font-bold leading-6">
                <span>Password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-muted" />
                  <Input ref={passwordRef} id="password" name="password" minLength={6} autoComplete="new-password" type={showPassword ? "text" : "password"} placeholder="Create a password" required className="h-12 rounded-xl border-paper-border bg-paper pl-12 pr-14 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/70 md:text-xl focus-visible:border-pink-400 focus-visible:ring-pink-300/35" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted focus-visible:outline-2 focus-visible:outline-[#c96f6a]">
                    {showPassword ? <EyeOff aria-hidden="true" className="h-6 w-6" /> : <Eye aria-hidden="true" className="h-6 w-6" />}
                  </button>
                </span>
              </label>

              {error && <p role="alert" className="rounded-lg bg-sticky-pink/45 px-4 py-3 text-center text-base text-ink">{error}</p>}

              <button type="submit" className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#c96f6a] text-2xl font-bold text-paper-card shadow-md transition hover:-translate-y-0.5 hover:bg-[#b85c5e] disabled:cursor-wait disabled:opacity-70">
                {isSubmitting ? "Creating account…" : "Create account"} {!isSubmitting && <ArrowRight className="h-7 w-7" />}
              </button>
              </fieldset>
            </form>
            <GoogleSignInButton disabled={isSubmitting} onBusyChange={setGoogleBusy} />
            <p className="mt-3 text-center text-base leading-5 text-ink-muted">
              Already received a code? <Link to="/verify-email" className="font-bold underline underline-offset-4">Verify your email</Link>
            </p>

            <p className="mt-3 text-center text-base leading-5 text-ink-muted">
              By creating an account, you agree to our<br className="hidden sm:block" />{" "}
              <a href="#" className="underline decoration-ink-muted underline-offset-4">Terms of Service</a>{" "}
              and <a href="#" className="underline decoration-ink-muted underline-offset-4">Privacy Policy</a>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
