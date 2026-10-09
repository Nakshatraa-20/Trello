import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  FolderHeart,
  GraduationCap,
  Heart,
  Laptop,
  Lightbulb,
  Plus,
  Sparkles,
  Trophy,
  UserPlus,
  UsersRound,
} from "lucide-react";
import InviteMemberModal, { PaperDialog } from "./InviteMemberModal";
import { API_URL } from "../config";
interface Workspace {
  id: number;
  name: string;
  description: string;
}
interface Membership {
  role: string;
  org: Workspace;
}
interface WorkspaceBoard {
  id: number;
  title: string;
  description: string | null;
  emoji: string | null;
  orgId: number;
}
const cardColors = [
  "bg-[#c2dfe9]",
  "bg-[#f3c4be]",
  "bg-[#cce1bd]",
  "bg-[#f9e2a0]",
  "bg-[#dbd0e8]",
];
const boardIcons = [GraduationCap, Laptop, UsersRound, Lightbulb, Trophy];

function Tape({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rounded-sm border border-white/20 bg-[#dfbf87]/65 shadow-[0_2px_3px_rgba(83,65,45,0.06)] ${className}`}
    />
  );
}

function CreateBoardModal({
  orgId,
  onClose,
  onCreated,
}: {
  orgId: number;
  onClose: () => void;
  onCreated: (board: WorkspaceBoard) => void;
}) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  async function createBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || requestRef.current) return;
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
      const response = await fetch(`${API_URL}/board/org-board-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), orgId }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message || "Unable to create the board. Please try again.",
        );
      if (!data?.board || data.board.orgId !== orgId)
        throw new Error(
          "The board could not be loaded. Please refresh this page.",
        );
      if (request.signal.aborted) return;
      onCreated(data.board);
      onClose();
    } catch (cause) {
      if (!request.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to create the board.",
        );
    } finally {
      requestRef.current = null;
      if (!request.signal.aborted) setCreating(false);
    }
  }

  return (
    <PaperDialog
      title="Make room for a new idea."
      description="Give your board a name. You can start adding tasks as soon as it’s created."
      onClose={onClose}
      busy={creating}
    >
      <form onSubmit={createBoard} aria-busy={creating}>
        <fieldset disabled={creating} className="space-y-5">
          <label
            htmlFor="workspace-board-title"
            className="block text-xl font-bold"
          >
            Board name
          </label>
          <input
            id="workspace-board-title"
            autoFocus
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Our next big project"
            className="h-14 w-full rounded-xl border border-paper-border bg-paper px-4 text-xl outline-none placeholder:text-ink-muted/60 focus:border-[#c96f6a] focus:ring-2 focus:ring-sticky-pink/40"
          />
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-sticky-pink/35 px-4 py-3 text-base"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#c96f6a] text-xl font-bold text-paper-card shadow-sm transition hover:bg-[#b85c5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c96f6a] disabled:cursor-wait disabled:opacity-60"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            {creating ? "Creating your board…" : "Create board"}
          </button>
        </fieldset>
      </form>
    </PaperDialog>
  );
}

export default function WorkspacePage() {
  const { orgId } = useParams();
  const workspaceId = Number(orgId);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [boards, setBoards] = useState<WorkspaceBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const request = new AbortController();
    setLoading(true);
    setError("");
    setMembership(null);
    setBoards([]);
    setInviteOpen(false);
    setCreateOpen(false);
    setNotice("");

    async function loadWorkspace() {
      try {
        if (!Number.isSafeInteger(workspaceId) || workspaceId <= 0)
          throw new Error("This workspace link is not valid.");
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please sign in to open your workspace.");
        const options = {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(15_000),
          ]),
        };
        const [orgResponse, boardsResponse] = await Promise.all([
          fetch(`${API_URL}/organisation/getorg`, options),
          fetch(`${API_URL}/board/workspace`, options),
        ]);
        const [orgData, boardsData] = await Promise.all([
          orgResponse.json().catch(() => null),
          boardsResponse.json().catch(() => null),
        ]);
        if (!orgResponse.ok || !boardsResponse.ok) {
          throw new Error(
            orgData?.message ||
              boardsData?.message ||
              "Unable to load this workspace. Please try again.",
          );
        }
        if (
          !Array.isArray(orgData?.memberships) ||
          !Array.isArray(boardsData?.boards)
        ) {
          throw new Error("Unable to load this workspace. Please try again.");
        }
        const currentMembership = (orgData.memberships as Membership[]).find(
          (item) => item.org.id === workspaceId,
        );
        if (!currentMembership)
          throw new Error(
            "This workspace isn’t available, or you don’t have access to it.",
          );
        if (request.signal.aborted) return;
        setMembership(currentMembership);
        setBoards(
          (boardsData.boards as WorkspaceBoard[]).filter(
            (board) => board.orgId === workspaceId,
          ),
        );
      } catch (cause) {
        if (!request.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load this workspace.",
          );
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    }
    void loadWorkspace();
    return () => request.abort();
  }, [workspaceId, reload]);

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-paper px-4 py-5 font-handwritten text-ink sm:px-8 sm:py-9 lg:px-12">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-24 -top-20 -z-10 h-96 w-96 rounded-full bg-sticky-yellow/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-32 -right-20 -z-10 h-[500px] w-[500px] rounded-full bg-sticky-pink/15 blur-3xl"
      />
      <main className="relative mx-auto min-h-[calc(100dvh-4.5rem)] max-w-[1240px] rounded-[1.6rem] border border-paper-border/65 bg-paper-card/35 px-5 pb-12 pt-6 shadow-[0_3px_18px_rgba(92,73,47,0.05)] sm:px-9 sm:pt-8 lg:px-12 lg:pb-16">
        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-2 rounded text-lg font-bold text-ink-muted transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c96f6a]"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-5 w-5 transition group-hover:-translate-x-1"
          />
          Back to dashboard
        </Link>

        <header className="relative mb-10 mt-10 flex flex-col gap-7 lg:mb-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4 sm:gap-5 lg:pt-4">
            <span
              aria-hidden="true"
              className="grid h-14 w-14 shrink-0 -rotate-6 place-items-center rounded-[44%] bg-[#f8dfa2]/80 sm:h-17 sm:w-17"
            >
              <UsersRound className="h-8 w-8 rotate-6" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 pt-3 sm:pt-4">
              <h1 className="break-words text-2xl font-bold lowercase leading-8 tracking-tight sm:text-3xl sm:leading-9">
                {membership?.org.name || "My workspace"}
              </h1>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
                {membership?.org.description ||
                  "A place for team projects, ideas, and a little everyday progress."}
              </p>
              <div className="mt-5 flex items-center gap-2 text-base text-ink-muted">
                <FolderHeart aria-hidden="true" className="h-4 w-4" />
                {loading
                  ? "Gathering your boards…"
                  : error
                    ? "Your shared creative space"
                    : `${boards.length} ${boards.length === 1 ? "board" : "boards"} · a little space for big ideas`}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-5 lg:items-end">
            <aside
              aria-label="Workspace inspiration"
              className="relative mr-2 hidden w-32 rotate-[5deg] border border-[#d6b879]/35 bg-[#f9e2a0] px-4 pb-3 pt-5 text-center shadow-[2px_4px_7px_rgba(83,65,45,0.12)] lg:block"
            >
              <Tape className="-rotate-3" />
              <p className="text-xl leading-6">
                Same people.
                <br />
                Bigger ideas.
                <Heart
                  aria-hidden="true"
                  className="mx-auto mt-1 h-4 w-4"
                  strokeWidth={1.8}
                />
              </p>
            </aside>
            <div className="flex flex-wrap items-center gap-3">
              {membership?.role === "admin" && (
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-paper-border bg-paper-card/70 px-4 text-lg font-bold text-ink-muted transition hover:border-[#c96f6a] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c96f6a]"
                >
                  <UserPlus aria-hidden="true" className="h-5 w-5" />
                  Invite people
                </button>
              )}
              <button
                type="button"
                disabled={!membership || loading}
                onClick={() => setCreateOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#b9645f]/30 bg-[#c96f6a] px-5 text-lg font-bold text-paper-card shadow-sm transition hover:-translate-y-0.5 hover:bg-[#b85c5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c96f6a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus aria-hidden="true" className="h-5 w-5" />
                Create board
              </button>
            </div>
          </div>
        </header>

        {notice && (
          <p
            role="status"
            className="mb-7 rounded-lg border border-sticky-green bg-sticky-green/20 px-4 py-3 text-lg"
          >
            {notice}
          </p>
        )}
        {error ? (
          <section
            role="alert"
            className="rounded-xl border border-paper-border bg-paper-card/80 p-7 text-center"
          >
            <p className="text-xl">{error}</p>
            <div className="mt-4 flex justify-center gap-5 text-lg font-bold">
              <button
                type="button"
                onClick={() => setReload((value) => value + 1)}
                className="underline underline-offset-4"
              >
                Try again
              </button>
              <Link
                to="/login"
                className="text-[#b85c5e] underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          </section>
        ) : loading ? (
          <div
            role="status"
            aria-label="Loading workspace boards"
            className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-lg border border-paper-border/40 bg-paper-dark/60 motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : (
          <section
            aria-label="Workspace boards"
            className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {boards.map((board, index) => {
              const Icon = boardIcons[index % boardIcons.length]!;
              return (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  className={`group relative flex min-h-56 min-w-0 flex-col rounded-lg border border-ink/5 px-6 pb-6 pt-7 shadow-[1px_4px_7px_rgba(83,65,45,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[2px_8px_14px_rgba(83,65,45,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c96f6a] motion-reduce:transform-none ${cardColors[index % cardColors.length]}`}
                >
                  <Tape className={index % 2 ? "rotate-2" : "-rotate-2"} />
                  <div
                    aria-hidden="true"
                    className="mb-4 flex h-8 items-center text-ink/85"
                  >
                    {board.emoji ? (
                      <span className="text-3xl">{board.emoji}</span>
                    ) : (
                      <Icon className="h-8 w-8" strokeWidth={1.7} />
                    )}
                  </div>
                  <h2 className="break-words text-2xl font-bold leading-tight">
                    {board.title}
                  </h2>
                  <p className="mb-5 mt-2 line-clamp-3 break-words text-lg leading-snug text-ink/70">
                    {board.description || "A fresh page for your next project."}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-3 text-lg font-bold">
                    Open board
                    <ArrowRight
                      aria-hidden="true"
                      className="h-5 w-5 transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="group flex min-h-56 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-paper-border bg-paper-card/20 px-6 py-8 text-ink-muted transition hover:border-[#c96f6a]/60 hover:bg-sticky-pink/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c96f6a]"
            >
              <Plus
                aria-hidden="true"
                className="h-9 w-9 transition group-hover:rotate-90 motion-reduce:transform-none"
                strokeWidth={1.5}
              />
              <span className="text-xl font-bold">
                {boards.length
                  ? "Create a new board"
                  : "Create your first board"}
              </span>
              {!boards.length && (
                <span className="max-w-52 text-center text-base leading-relaxed">
                  Every good project starts with a little space to think.
                </span>
              )}
            </button>
          </section>
        )}
        <div
          aria-hidden="true"
          className="mt-12 flex items-center justify-center gap-3 text-ink-muted/65"
        >
          <Sparkles className="h-5 w-5" strokeWidth={1.3} />
          <p className="text-lg">
            A few ideas. A little teamwork. Good things ahead.
          </p>
        </div>
      </main>
      {inviteOpen && membership && (
        <InviteMemberModal
          orgId={workspaceId}
          onClose={() => setInviteOpen(false)}
          onSuccess={() =>
            setNotice("Invitation sent. There’s room for one more good idea.")
          }
        />
      )}
      {createOpen && membership && (
        <CreateBoardModal
          orgId={workspaceId}
          onClose={() => setCreateOpen(false)}
          onCreated={(board) => {
            setBoards((previous) =>
              previous.some((item) => item.id === board.id)
                ? previous
                : [...previous, board],
            );
            setNotice(
              `“${board.title}” is ready. Open it to start adding tasks.`,
            );
          }}
        />
      )}
    </div>
  );
}
