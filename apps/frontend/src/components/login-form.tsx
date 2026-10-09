import { cn } from "cn";
import { type ComponentProps, type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Heart, LockKeyhole, Sparkles, UserRound } from "lucide-react";

import signupDeskScene from "@/assets/signup-desk-scene.png";
import { Input } from "@/components/ui/input";
import { GoogleSignInButton } from "./google-signin-button";
import { authRequest, finishSignIn, rememberVerificationEmail } from "@/lib/auth";

export function LoginForm({ className, ...props }: ComponentProps<"div">) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [googleBusy, setGoogleBusy] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const busy = isSubmitting || googleBusy;
  useEffect(() => () => requestRef.current?.abort(), []);

  async function boardLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (requestRef.current || googleBusy) return;
    const request = new AbortController();
    requestRef.current = request;
    setError("");
    setIsSubmitting(true);

    try {
      const data = await authRequest("/signin", {
        identifier: usernameRef.current?.value.trim() ?? "",
        password: passwordRef.current?.value ?? "",
      }, request.signal);
      if (request.signal.aborted) return;
      finishSignIn(data.token);
      navigate("/dashboard", { replace: true });
    } catch (cause) {
      if (!request.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      requestRef.current = null;
      if (!request.signal.aborted) setIsSubmitting(false);
    }
  }

  return (
    <div
      className={cn("relative isolate min-h-dvh overflow-x-clip bg-paper font-handwritten text-ink", className)}
      {...props}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-[440px] w-[440px] rounded-full bg-sticky-pink/35 blur-xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-36 h-96 w-96 rounded-full bg-sticky-pink/50 blur-sm" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sticky-green/45 blur-sm" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-tl-[12rem] bg-sticky-green/35" />
      <img aria-hidden="true" src={signupDeskScene} alt="" className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden w-full min-w-[900px] lg:block" />

      <main className="relative mx-auto grid min-h-dvh max-w-6xl content-center gap-8 px-4 pb-6 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-start lg:gap-12 lg:px-8">
        <section className="relative hidden pt-6 lg:block">
          <h1 className="max-w-lg font-handwritten text-5xl font-bold leading-[1.15] tracking-tight xl:text-6xl">
            Your ideas<br />belong somewhere<br />
            <span className="relative inline-block">
              <span aria-hidden="true" className="absolute -inset-x-2 bottom-1 -z-10 h-7 -rotate-3 rounded-sm bg-sticky-pink/70" />
              beautiful.
            </span>{" "}
            <Heart aria-hidden="true" className="inline h-11 w-11 align-middle text-pink-400" strokeWidth={1.6} />
          </h1>
          <p className="mt-6 max-w-md text-2xl leading-relaxed text-ink-muted">
            Organise your boards, projects and thoughts in one place.
          </p>
          <svg aria-hidden="true" className="ml-auto mr-8 mt-6 h-24 w-32 text-ink" viewBox="0 0 140 100" fill="none">
            <path d="M12 9C10 70 99 83 86 47C73 18 46 70 94 82C104 85 114 80 126 72M108 70L128 70L121 90" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </section>

        <section aria-labelledby="signin-title" className="relative mx-auto w-full max-w-[500px]">
          <div aria-hidden="true" className="absolute -top-4 left-1/2 z-20 h-8 w-32 -translate-x-1/2 -rotate-6 border border-paper-card/60 opacity-90 shadow-sm" style={{ backgroundColor: "#fff5ed", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px), repeating-linear-gradient(90deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px)" }} />
          <svg aria-hidden="true" className="absolute -left-14 top-3 hidden h-14 w-12 text-ink lg:block" viewBox="0 0 48 56" fill="none">
            <path d="M7 43L28 42M12 20L30 31M29 5L37 23" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
          </svg>

          <div className="rounded-[2rem] border border-paper-border bg-paper-card/95 px-5 py-6 shadow-[0_18px_50px_rgba(83,65,45,0.16)] sm:px-8">
            <div className="mb-5">
              <h2 id="signin-title" className="font-handwritten text-3xl font-bold leading-tight tracking-tight sm:text-[2rem]">
                Welcome back! <span className="inline-block text-pink-400">♡</span>
              </h2>
              <p className="mt-1.5 text-lg leading-6 text-ink-muted">
                Sign in to continue to your boards and workspaces.
              </p>
            </div>

            <form onSubmit={boardLogin} aria-busy={busy}>
              <fieldset disabled={busy} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="username" className="block text-lg font-bold leading-6">Username or email</label>
                <div className="relative">
                  <UserRound aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 h-6 w-6 -translate-y-1/2 text-ink-muted" strokeWidth={2} />
                  <Input ref={usernameRef} id="username" name="identifier" type="text" autoComplete="username" placeholder="Enter your username or email" required className="h-12 rounded-xl border-paper-border bg-paper pl-12 pr-4 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/70 focus-visible:border-pink-400 focus-visible:ring-pink-300/35 md:text-xl" />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-lg font-bold leading-6">Password</label>
                <div className="relative">
                  <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 h-6 w-6 -translate-y-1/2 text-ink-muted" strokeWidth={2} />
                  <Input ref={passwordRef} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required className="h-12 rounded-xl border-paper-border bg-paper pl-12 pr-14 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/70 focus-visible:border-pink-400 focus-visible:ring-pink-300/35 md:text-xl" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition hover:bg-paper-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c96f6a]">
                    {showPassword ? <EyeOff aria-hidden="true" className="h-6 w-6" /> : <Eye aria-hidden="true" className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              {error && <p role="alert" className="rounded-lg bg-sticky-pink/45 px-4 py-3 text-center text-base text-ink">{error}</p>}

              <button disabled={isSubmitting} type="submit" className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#c96f6a] font-handwritten text-2xl font-bold text-paper-card shadow-md transition hover:-translate-y-0.5 hover:bg-[#b85c5e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c96f6a] disabled:cursor-wait disabled:opacity-70">
                {isSubmitting ? "Signing in…" : "Sign in"}
                {!isSubmitting && <ArrowRight aria-hidden="true" className="h-7 w-7" strokeWidth={2} />}
              </button>
              </fieldset>
            </form>
            <GoogleSignInButton disabled={isSubmitting} onBusyChange={setGoogleBusy} />
            <p className="mt-3 text-center text-base leading-5 text-ink-muted">
              Have a verification code? <Link to="/verify-email" onClick={() => {
                const identifier = usernameRef.current?.value.trim() ?? "";
                if (identifier) rememberVerificationEmail(identifier.includes("@") ? identifier : "");
              }} className="font-bold underline underline-offset-4">Verify your email</Link>
            </p>

            <p className="mt-3 text-center text-base leading-5 text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="inline-block border-b-2 border-pink-400 font-bold text-pink-500 transition hover:border-[#b85c5e] hover:text-ink">Create one</Link>
            </p>
          </div>
          <Sparkles aria-hidden="true" className="absolute -bottom-5 -right-5 hidden h-9 w-9 text-ink lg:block" strokeWidth={1.4} />
        </section>
      </main>
    </div>
  );
}
