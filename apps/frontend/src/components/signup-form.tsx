import { type ComponentProps, type FormEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Heart, LockKeyhole, Mail, Sparkles, Star, UserRound, UsersRound } from "lucide-react";

import signupDeskScene from "@/assets/signup-desk-scene.png";
import { Input } from "@/components/ui/input";

export function SignupForm({ className = "", ...props }: ComponentProps<"div">) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const response = await fetch("http://localhost:3001/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameRef.current?.value,
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message ?? "Unable to create your account.");
      return;
    }

    navigate("/login");
  }

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-paper font-handwritten text-ink ${className}`}
      {...props}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-[440px] w-[440px] rounded-full bg-sticky-pink/35 blur-xl" />
      <div aria-hidden="true" className="absolute -right-32 top-36 h-96 w-96 rounded-full bg-sticky-pink/50 blur-sm" />
      <div aria-hidden="true" className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sticky-green/45 blur-sm" />
      <div aria-hidden="true" className="absolute bottom-0 right-0 h-80 w-80 rounded-tl-[12rem] bg-sticky-green/35" />
      <img
        aria-hidden="true"
        src={signupDeskScene}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 z-0 hidden w-full min-w-[900px] lg:block"
      />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-end px-6 py-8 lg:px-12">
        <p className="text-base text-ink-muted sm:text-xl">
          Already have an account?{" "}
          <Link to="/login" className="ml-1 border-b-2 border-pink-400 pb-1 font-bold text-pink-500">
            Sign in
          </Link>
        </p>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-start lg:gap-10 lg:px-12 lg:pb-56 lg:pt-10">
        <section className="relative hidden flex-col lg:flex lg:pt-14">
          <svg aria-hidden="true" className="absolute left-0 -top-8 h-20 w-28 text-ink" viewBox="0 0 112 80" fill="none">
            <path d="M11 45L34 50M15 29L34 40M37 16L43 37" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M84 8L88 22L100 27L88 32L84 47L80 32L68 27L80 22L84 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <h1 className="max-w-md font-handwritten text-5xl font-bold leading-[1.15] tracking-tight xl:text-6xl">
            Let&apos;s create<br />your space. <span className="text-pink-400">♡</span>
          </h1>
          <div className="mt-5 h-1 w-48 -rotate-3 rounded-full bg-[#e7aa9f]" />
          <p className="mt-10 max-w-md text-3xl leading-relaxed text-ink-muted">
            A space for your ideas, projects, and everything in between.
          </p>

          <div className="mt-12 space-y-6 text-2xl leading-relaxed text-ink-muted">
            <div className="flex items-center gap-5">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sticky-pink text-ink"><Star className="h-7 w-7" /></span>
              <span>Keep track<br />of what matters</span>
            </div>
            <div className="flex items-center gap-5">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sticky-green text-ink"><UsersRound className="h-7 w-7" /></span>
              <span>Collaborate<br />with your people</span>
            </div>
            <div className="flex items-center gap-5">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sticky-yellow text-ink"><Heart className="h-7 w-7" /></span>
              <span>Turn ideas<br />into real progress</span>
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[560px] lg:justify-self-end">
          <div aria-hidden="true" className="absolute -top-5 left-1/2 z-20 h-11 w-40 -translate-x-1/2 rotate-6 border border-paper-card/60 opacity-90 shadow-sm" style={{ backgroundColor: "#fff5ed", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px), repeating-linear-gradient(90deg, transparent 0 8px, rgba(207,119,124,.38) 8px 16px)" }} />
          <div aria-hidden="true" className="absolute -left-12 top-0 hidden h-12 w-10 text-ink lg:block">
            <Sparkles className="h-10 w-10" strokeWidth={1.7} />
          </div>

          <div className="rounded-[2rem] border border-paper-border bg-paper-card/95 px-7 py-12 shadow-[0_18px_50px_rgba(83,65,45,0.16)] sm:px-12 sm:py-14">
            <div className="mb-8">
              <h2 className="font-handwritten text-4xl font-bold tracking-tight">
                Create your account <span className="text-pink-400">♡</span>
              </h2>
              <p className="mt-3 text-xl text-ink-muted">Join and start organising your boards.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block space-y-2 text-xl font-bold">
                <span>Username</span>
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-muted" />
                  <Input ref={usernameRef} id="username" type="text" placeholder="Choose a username" required className="h-16 rounded-xl border-paper-border bg-paper px-14 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/70 md:text-xl focus-visible:border-pink-400 focus-visible:ring-pink-300/35" />
                </span>
              </label>

              <label className="block space-y-2 text-xl font-bold">
                <span>Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-muted" />
                  <Input ref={emailRef} id="email" type="email" placeholder="Enter your email" required className="h-16 rounded-xl border-paper-border bg-paper px-14 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/70 md:text-xl focus-visible:border-pink-400 focus-visible:ring-pink-300/35" />
                </span>
              </label>

              <label className="block space-y-2 text-xl font-bold">
                <span>Password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-muted" />
                  <Input ref={passwordRef} id="password" type="password" placeholder="Create a password" required className="h-16 rounded-xl border-paper-border bg-paper px-14 pr-14 font-handwritten text-xl font-normal text-ink placeholder:text-ink-muted/70 md:text-xl focus-visible:border-pink-400 focus-visible:ring-pink-300/35" />
                  <Eye className="pointer-events-none absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-muted" />
                </span>
              </label>

              {error && <p className="rounded-lg bg-sticky-pink/45 px-4 py-3 text-center text-base text-ink">{error}</p>}

              <button type="submit" className="flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-[#c96f6a] text-2xl font-bold text-paper-card shadow-md transition hover:-translate-y-0.5 hover:bg-[#b85c5e]">
                Create account <ArrowRight className="h-7 w-7" />
              </button>
            </form>

            <p className="mt-8 text-center text-lg leading-relaxed text-ink-muted">
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
