import { Search } from "lucide-react";

function Navbar() {
  return (
    <header className="h-16 border-b border-paper-border bg-paper-dark text-ink shadow-sm">
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
    </header>
  );
}

export default Navbar;
