import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Pin, Plus } from "lucide-react";
import Board from "./Board";
import Invitation from "./Invitation"
import { PaperDialog } from "./InviteMemberModal";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");
interface Board {
  id: number;
  title: string;
  userId: number | null;
  orgId: number | null;
  description: string | null;
  emoji: string | null;
}

interface Organization {
  id: number;
  name: string;
  description: string;
}
interface Membership {
  userId: number;
  orgId: number;
  role: string;
  org: Organization;
}

function CardAttachment({ id }: { id: number }) {
  switch (id % 3) {
    case 0:
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-14 -translate-x-1/2 rotate-2 rounded-sm border border-white/40 shadow-sm"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #f3a6b3 0, #f3a6b3 3px, #ffe4e8 3px, #ffe4e8 6px)",
          }}
        />
      );
    case 1:
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-14 -translate-x-1/2 -rotate-2 rounded-sm border border-white/40 shadow-sm"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #9fcdb0 0, #9fcdb0 3px, #e3f4e5 3px, #e3f4e5 6px)",
          }}
        />
      );
    default:
      return (
        <Pin
          aria-hidden="true"
          className="pointer-events-none absolute -top-5 left-5 z-10 h-8 w-8 -rotate-[28deg] text-[#c96072] drop-shadow-sm"
          fill="#f3a6b3"
          strokeWidth={1.8}
        />
      );
  }
}

function SparkleDoodles({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none h-14 w-20 ${className}`}
      viewBox="0 0 80 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 3L22 15L31 19L22 23L19 35L16 23L7 19L16 15L19 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M55 20L57 29L65 32L57 35L55 44L53 35L45 32L53 29L55 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccentLines({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none h-10 w-8 ${className}`}
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 8L13 13M3 19L13 20M5 30L13 26"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CreatePersonalBoardModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (board: Board) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🌷");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  async function createBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestRef.current) return;
    if (!title.trim()) {
      setError("Give your board a name first.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in again to create a board.");
      return;
    }
    const request = new AbortController();
    requestRef.current = request;
    setCreating(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/board/personal-board`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), emoji: emoji.trim() || "🌷" }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(
        typeof data?.message === "string" ? data.message : "Unable to create your board. Please try again.",
      );
      if (!data?.board || typeof data.board.id !== "number" || typeof data.board.title !== "string") {
        throw new Error("The board could not be loaded. Please refresh the dashboard.");
      }
      if (request.signal.aborted) return;
      onCreated(data.board);
      onClose();
    } catch (cause) {
      if (!request.signal.aborted) setError(
        cause instanceof TypeError ? "Unable to reach the server. Please try again." :
        cause instanceof Error ? cause.message : "Unable to create your board.",
      );
    } finally {
      requestRef.current = null;
      if (!request.signal.aborted) setCreating(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-paper-border bg-paper px-4 text-xl outline-none placeholder:text-ink-muted/60 focus:border-[#c96f6a] focus:ring-2 focus:ring-sticky-pink/40";

  return (
    <PaperDialog
      title="Make room for a new idea."
      description="A little space for your plans, projects, and everything in between."
      onClose={onClose}
      busy={creating}
    >
      <form onSubmit={createBoard} aria-busy={creating}>
        <fieldset disabled={creating} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="personal-board-title" className="block text-xl font-bold">Board name</label>
            <input id="personal-board-title" autoFocus required maxLength={100}
              value={title} onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. My next big project" className={`h-14 ${inputClass}`} />
          </div>
          <div className="space-y-2">
            <label htmlFor="personal-board-description" className="block text-xl font-bold">
              Description <span className="text-base font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea id="personal-board-description" rows={3} maxLength={500}
              value={description} onChange={(event) => setDescription(event.target.value)}
              placeholder="What would you like to bring to life?" className={`resize-y py-3 ${inputClass}`} />
          </div>
          <div className="space-y-2">
            <label htmlFor="personal-board-emoji" className="block text-xl font-bold">Board emoji</label>
            <div className="flex flex-wrap items-center gap-2">
              <input id="personal-board-emoji" aria-label="Board emoji" maxLength={32}
                value={emoji} onChange={(event) => setEmoji(event.target.value)}
                className="h-12 w-16 rounded-xl border border-paper-border bg-paper text-center text-2xl outline-none focus:border-[#c96f6a] focus:ring-2 focus:ring-sticky-pink/40" />
              {[{ icon: "🌷", name: "Tulip" }, { icon: "💡", name: "Light bulb" }, { icon: "📚", name: "Books" }, { icon: "🎨", name: "Art palette" }, { icon: "✨", name: "Sparkles" }].map(({ icon, name }) => (
                <button key={icon} type="button" aria-label={`Use ${name} emoji`} aria-pressed={emoji === icon}
                  onClick={() => setEmoji(icon)}
                  className={`h-10 w-10 rounded-lg border text-xl transition hover:bg-sticky-pink/30 focus-visible:outline-2 focus-visible:outline-[#c96f6a] ${emoji === icon ? "border-[#c96f6a] bg-sticky-pink/30" : "border-transparent bg-paper"}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-sticky-pink/35 px-4 py-3 text-lg">{error}</p>}
          <button type="submit" className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#c96f6a] text-xl font-bold text-paper-card shadow-sm transition hover:bg-[#b85c5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c96f6a] disabled:cursor-wait disabled:opacity-60">
            <Plus aria-hidden="true" className="h-5 w-5" />
            {creating ? "Creating your board…" : "Create board"}
          </button>
        </fieldset>
      </form>
    </PaperDialog>
  );
}

function Dashboard() {
  const [personalBoards, setPersonalBoards] = useState<Board[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);

  useEffect(() => {
    getPersonalBoards();
    getWorkspaceOrganisations();
  }, []);

  async function getPersonalBoards() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/board/personal`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log(data);
    setPersonalBoards(data.boards);
  }

  async function getWorkspaceOrganisations() {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3001/organisation/getorg", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      console.log(data.message);
      return;
    }
    setMemberships(data.memberships);
  }
  async function createOrganization() {
    const name = prompt("Enter workspace name");
    if (!name) return;

    const description = prompt("Enter workspace description");
    if (!description) return;

    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:3001/organisation/create-org",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.log(data.message);
      return;
    }

    console.log(data.organisation);
    await getWorkspaceOrganisations();
  }

  const boardColors = [
    "bg-board-rose",
    "bg-board-sage",
    "bg-board-blue",
    "bg-board-lilac",
  ];

  return (
    <div className="min-h-screen bg-paper text-ink font-handwritten">
      <main className="mx-auto max-w-[1280px] px-8 py-8">
        <header className="relative mb-10">
          <h1 className="text-5xl font-bold text-ink">Your boards</h1>
          <div className="mt-3 h-1 w-20 -rotate-1 rounded-full bg-[#C96F6A]" />
          <p className="mt-2 text-lg text-ink-muted">
            Plan projects, organise work, and keep everything moving.
          </p>
          <SparkleDoodles className="absolute left-[34rem] top-3 hidden text-ink-muted lg:block" />
          <div className="absolute right-12 top-0 -rotate-6">
            <AccentLines className="absolute -left-9 -top-2 -rotate-[28deg] text-ink-muted" />
            <AccentLines className="absolute -bottom-2 -right-9 rotate-[28deg] scale-x-[-1] text-ink-muted" />
            <div className="relative flex h-40 w-40 items-center justify-center border border-paper-border bg-sticky-pink p-5 text-center shadow-md">
              <div
                aria-hidden="true"
                className="absolute -top-3 left-1/2 z-10 h-7 w-14 -translate-x-1/2 -rotate-2 rounded-sm border border-white/25 bg-[#e8c790]/75 shadow-sm"
              />
              <p className="-rotate-2 text-center text-xl leading-7 text-ink-muted">
                Small steps
                <br />
                still move you
                <br />
                forward
                <br />♡
              </p>
            </div>
          </div>
        </header>
        <div>
          <div className="flex items-end justify-between border-b border-paper-border pb-3">
            <div>
              <div className="relative inline-block -rotate-1">
                <div
                  className="border border-paper-border bg-board-rose px-5 py-1.5 shadow-sm"
                  style={{
                    clipPath:
                      "polygon(0 0,100% 0,100% 8%,96% 12%,100% 16%,96% 20%,100% 24%,96% 28%,100% 32%,96% 36%,100% 40%,96% 44%,100% 48%,96% 52%,100% 56%,96% 60%,100% 64%,96% 68%,100% 72%,96% 76%,100% 80%,96% 84%,100% 88%,96% 92%,100% 96%,100% 100%,0 100%,0 96%,4% 92%,0 88%,4% 84%,0 80%,4% 76%,0 72%,4% 68%,0 64%,4% 60%,0 56%,4% 52%,0 48%,4% 44%,0 40%,4% 36%,0 32%,4% 28%,0 24%,4% 20%,0 16%,4% 12%,0 8%,4% 4%,0 0)",
                  }}
                >
                  <h2 className="text-3xl font-bold text-ink">
                    Personal boards
                  </h2>
                </div>
                <AccentLines className="absolute -left-9 top-1/2 -translate-y-1/2 -rotate-[12deg] text-ink-muted" />
              </div>
              <p className="mt-1 text-base text-ink-muted">
                Boards created for your own work.
              </p>
              < Invitation />
            </div>
          </div>

          <div className="mt-4  flex flex-wrap gap-4 ">
            {personalBoards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className={`group relative mt-3 flex h-40 w-60 flex-col rounded-md border border-paper-border p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${board.id % 2 === 0 ? "rotate-[0.5deg]" : "-rotate-[0.5deg]"} ${boardColors[board.id % boardColors.length]}`}
              >
                <CardAttachment id={board.id} />
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">{board.title}</h3>
                  <span className="text-2xl">{board.emoji}</span>
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  {board.description}
                </p>

                <p className="mt-auto font-semibold text-sm text-ink-muted">
                  Open board →
                </p>
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setCreateBoardOpen(true)}
              className="
    mt-3 flex h-40 w-60 -rotate-[0.5deg] cursor-pointer flex-col
    items-center justify-center gap-3
    rounded-md
    border-2 border-dashed border-paper-border
    bg-paper-dark
    text-ink-muted
    transition
    hover:-translate-y-1
    hover:bg-paper-dark
  "
            >
              <div
                className="
      flex h-12 w-12 items-center justify-center
      rounded-full
      border-2 border-ink-muted
      text-3xl font-normal text-ink-muted
    "
              >
                +
              </div>
              <span className="text-lg font-bold text-ink-muted">
                Create a new board
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="relative inline-block rotate-[0.5deg]">
                <div
                  className="border border-paper-border bg-board-sage px-5 py-1.5 shadow-sm"
                  style={{
                    clipPath:
                      "polygon(0 0,100% 0,100% 8%,96% 12%,100% 16%,96% 20%,100% 24%,96% 28%,100% 32%,96% 36%,100% 40%,96% 44%,100% 48%,96% 52%,100% 56%,96% 60%,100% 64%,96% 68%,100% 72%,96% 76%,100% 80%,96% 84%,100% 88%,96% 92%,100% 96%,100% 100%,0 100%,0 96%,4% 92%,0 88%,4% 84%,0 80%,4% 76%,0 72%,4% 68%,0 64%,4% 60%,0 56%,4% 52%,0 48%,4% 44%,0 40%,4% 36%,0 32%,4% 28%,0 24%,4% 20%,0 16%,4% 12%,0 8%,4% 4%,0 0)",
                  }}
                >
                  <h2 className="text-3xl font-bold text-ink">Workspaces</h2>
                </div>
                <AccentLines className="absolute -left-9 top-1/2 -translate-y-1/2 rotate-[8deg] text-ink-muted" />
              </div>
              <p className="mt-1 text-base text-ink-muted">
                Shared boards for your team and projects.
              </p>
            </div>
            <button
              onClick={createOrganization}
              className="rounded-md border border-paper-border  px-5 py-2.5 bg-accent text-lg font-bold text-paper-card shadow-md transition hover:-translate-y-0.5 hover:opacity-90"
            >
              + Create Workspace
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            {memberships.map((membership) => (
              <Link
                key={membership.org.id}
                to={`/workspace/${membership.org.id}`}
                className={`group relative mt-3 flex h-40 w-72 flex-col rounded-md border border-paper-border p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${membership.org.id % 2 === 0 ? "rotate-[0.5deg]" : "-rotate-[0.5deg]"} ${boardColors[membership.org.id % boardColors.length]}`}
              >
                <CardAttachment id={membership.org.id} />
                <h3 className="text-xl font-semibold">{membership.org.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  {membership.org.description}
                </p>
                <p className="mt-auto text-sm font-semibold text-ink-muted">
                  View boards →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      {createBoardOpen && (
        <CreatePersonalBoardModal
          onClose={() => setCreateBoardOpen(false)}
          onCreated={(board) => setPersonalBoards((previous) => [...previous, board])}
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-9 right-12 z-10 h-32 w-72"
      >
        <p className="absolute right-0 top-1 rotate-[-6deg] text-right font-handwritten text-2xl leading-7 text-ink-muted">
          Ideas become things
          <br />
          when you begin. <span className="text-accent">✦</span>
        </p>
        <svg
          className="absolute bottom-0 right-40 h-12 w-16 -rotate-6 text-ink-muted"
          viewBox="0 0 80 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 8C10 31 30 44 57 39"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M50 31L59 39L49 46"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
export default Dashboard;
