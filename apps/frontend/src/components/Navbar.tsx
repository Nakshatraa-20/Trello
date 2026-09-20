import { Search } from "lucide-react";

function Navbar() {
  return (
    <header className="relative h-16 border-b border-paper-border bg-paper-dark text-ink shadow-sm">
      <div className="mx-auto flex h-full max-w-[1600px] items-center px-6">
        <div className="flex w-[45%] items-center gap-3 rounded-lg bg-paper-dark px-4 py-2 ">
          <Search size={20} className="text-ink-muted" />

          <input
            type="text"
            placeholder="Search boards, tasks..."
            className="
                  w-full
                  bg-transparent
                  text-lg text-ink
                  outline-none
                  placeholder:text-ink-muted
                "
          />
        </div>
      </div>
      <aside className="pointer-events-none absolute top-12 right-[23%] z-20 hidden h-36 w-32 -rotate-3 border border-paper-border bg-paper-card/95 p-4 shadow-md lg:block">
        <div className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 rounded-sm border border-white/25 bg-[#e8c790]/75" />
        <p className="font-handwritten text-2xl leading-7 text-ink">
          Good<br />
          things<br />
          take time <span className="text-accent">♥</span>
        </p>
      </aside>
    </header>
  );
}

export default Navbar;
