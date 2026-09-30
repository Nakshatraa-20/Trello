import { cn } from "cn";
import { type ComponentProps, type FormEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Heart, LockKeyhole, Sparkles, UserRound } from "lucide-react";

import signupDeskScene from "@/assets/signup-desk-scene.png";
import { Input } from "@/components/ui/input";

export function LoginForm({ className, ...props }: ComponentProps<"div">) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function boardLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/user/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameRef.current?.value,
          password: passwordRef.current?.value,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.token) {
        setError(data.message ?? "Unable to sign in. Please check your details.");
        return;
      }
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch {
      setError("Unable to connect. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={cn("relative isolate min-h-screen overflow-hidden bg-paper font-handwritten text-ink", className)}
      {...props}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-[440px] w-[600px] -rotate-12 rounded-[45%] bg-sticky-pink/35 blur-xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-32 h-[430px] w-[430px] rounded-[45%] bg-sticky-pink/50 blur-sm" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-44 right-0 h-96 w-[650px] rotate-12 rounded-[45%] bg-sticky-pink/35 blur-xl" />
      <svg aria-hidden="true" className="pointer-events-none absolute -right-12 -top-8 hidden h-64 w-[560px] text-[#b7906e]/60 md:block" viewBox="0 0 560 260" fill="none">
        <path d="M70 0C28 160 312 194 290 92C272 21 161 136 320 214C391 249 487 236 559 207" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <img aria-hidden="true" src={signupDeskScene} alt="" className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden w-full min-w-[900px] lg:block" />

      <main className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-20 sm:px-10 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-start lg:gap-16 lg:px-12 lg:pb-80 lg:pt-32">
        <section className="relative hidden pt-14 lg:block">
          <h1 className="max-w-lg text-5xl leading-[1.22] tracking-tight xl:text-6xl">
            Your ideas<br />belong somewhere<br />
            <span className="relative inline-block">
              <span aria-hidden="true" className="absolute -inset-x-2 bottom-1 -z-10 h-7 -rotate-3 rounded-sm bg-sticky-pink/70" />
              beautiful.
            </span>{" "}
            <Heart aria-hidden="true" className="inline h-11 w-11 align-middle" strokeWidth={1.6} />
          </h1>
          <p className="mt-10 max-w-sm text-3xl leading-relaxed text-ink-muted">
            Organise your boards, projects and thoughts in one place.
          </p>
          <svg aria-hidden="true" className="ml-auto mr-8 mt-6 h-24 w-32 text-ink" viewBox="0 0 140 100" fill="none">
            <path d="M12 9C10 70 99 83 86 47C73 18 46 70 94 82C104 85 114 80 126 72M108 70L128 70L121 90" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </section>

        <section aria-labelledby="signin-title" className="relative mx-auto w-full max-w-[560px]">
          <div aria-hidden="true" className="absolute -top-5 left-1/2 z-20 h-11 w-40 -translate-x-1/2 rotate-6 border border-paper-card/60 opacity-90 shadow-sm" style={{ backgroundColor: "#fff5ed", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px), repeating-linear-gradient(90deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px)" }} />
          <svg aria-hidden="true" className="absolute -left-14 top-3 hidden h-14 w-12 text-ink lg:block" viewBox="0 0 48 56" fill="none">
            <path d="M7 43L28 42M12 20L30 31M29 5L37 23" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
          </svg>

          <div className="rounded-[2rem] border border-paper-border bg-paper-card/95 px-6 py-12 shadow-[0_16px_48px_rgba(83,65,45,0.12)] sm:px-12 sm:py-14">
            <div className="text-center">
              <h2 id="signin-title" className="text-4xl leading-tight tracking-tight sm:text-5xl">
                Welcome back! <span className="inline-block text-pink-400">♡</span>
              </h2>
              <p className="mt-4 text-xl leading-relaxed text-ink-muted sm:text-2xl">
                Sign in to continue to your boards and workspaces.
              </p>
            </div>

            <form className="mt-10 space-y-7" onSubmit={boardLogin} aria-busy={isSubmitting}>
              <div className="space-y-2">
                <label htmlFor="username" className="block text-2xl">Username</label>
                <div className="relative">
                  <UserRound aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 z-10 h-6 w-6 -translate-y-1/2 text-ink-muted" strokeWidth={1.7} />
                  <Input ref={usernameRef} id="username" name="username" type="text" autoComplete="username" placeholder="Enter your username" required className="h-16 rounded-xl border-paper-border bg-paper px-14 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/65 focus-visible:border-[#c96f6a] focus-visible:ring-[#c96f6a]/20 md:text-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-2xl">Password</label>
                <div className="relative">
                  <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 z-10 h-6 w-6 -translate-y-1/2 text-ink-muted" strokeWidth={1.7} />
                  <Input ref={passwordRef} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required className="h-16 rounded-xl border-paper-border bg-paper px-14 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/65 focus-visible:border-[#c96f6a] focus-visible:ring-[#c96f6a]/20 md:text-xl" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition hover:bg-paper-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c96f6a]">
                    {showPassword ? <EyeOff aria-hidden="true" className="h-6 w-6" /> : <Eye aria-hidden="true" className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              {error && <p role="alert" className="rounded-xl bg-sticky-pink/35 px-4 py-3 text-lg text-ink">{error}</p>}

              <button disabled={isSubmitting} type="submit" className="flex h-16 w-full items-center justify-center gap-4 rounded-xl bg-[#c96f6a] font-handwritten text-3xl text-paper-card shadow-sm transition hover:bg-[#b85c5e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c96f6a] disabled:cursor-wait disabled:opacity-70">
                {isSubmitting ? "Signing in…" : "Sign in"}
                {!isSubmitting && <ArrowRight aria-hidden="true" className="h-7 w-7" strokeWidth={1.7} />}
              </button>
            </form>

            <p className="mt-9 text-center text-xl leading-relaxed text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="inline-block border-b-2 border-pink-400 text-pink-500 transition hover:border-[#b85c5e] hover:text-ink">Create one</Link>
            </p>
          </div>
          <Sparkles aria-hidden="true" className="absolute -bottom-20 right-8 hidden h-12 w-12 text-ink lg:block" strokeWidth={1.4} />
        </section>
      </main>
    </div>
  );
}
