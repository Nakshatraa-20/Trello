import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Board from "./Board";

interface Board {
  id: number;
  title: string;
  userId: number | null;
  orgId: number | null;
  description: string | null;
  emoji: String| null
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

function Dashboard() {
  const [personalBoards, setPersonalBoards] = useState<Board[]>([]);
  const [workspaceBoards, setWorkspaceBoards] = useState<Board[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);

  useEffect(() => {
    getPersonalBoards();
    getWorkspaceBoards();
    getWorkspaceOrganisations();
  }, []);

  async function getPersonalBoards() {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3001/board/personal", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log(data);
    setPersonalBoards(data.boards);
  }

  async function createPersonalBoard() {
    const title = prompt("enter board name");
    if (!title) return;

    const description= prompt("enter board description")
    if(!description)
      return
    const emoji= prompt("choose an emoji for your board")
    if(!emoji)
      return
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3001/board/personal-board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        emoji
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.log(data.message);
      return;
    }

    setPersonalBoards((prev) => [...prev, data.board]);
  }

  async function getWorkspaceBoards() {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3001/board/workspace", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      console.log(data.message);
      return;
    }
    setWorkspaceBoards(data.boards);
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

  async function createWorkspaceBoards(orgId: number) {
    const title = prompt("Enter board name");
    if (!title) {
      return;
    }
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3001/board/org-board-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        title,
        orgId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.log(data.message);
      return;
    }

    setWorkspaceBoards((prev) => [...prev, data.board]);
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
          <div className="absolute right-12 top-0 -rotate-6">
            <div className="relative flex h-40 w-40 items-center justify-center border border-paper-border bg-sticky-pink p-5 text-center shadow-md">
              <div
                aria-hidden="true"
                className="absolute -top-3 left-1/2 z-10 h-7 w-14 -translate-x-1/2 -rotate-2 rounded-sm border border-white/25 bg-[#e8c790]/75 shadow-sm"
              />
              <p className="-rotate-2 text-center text-xl leading-7 text-ink-muted">
                Small steps<br />
                still move you<br />
                forward<br />
                ♡
              </p>
            </div>
          </div>
        </header>
        <div>
          <div className="flex items-end justify-between border-b border-paper-border pb-3">
            <div>
              <h2 className="text-2xl font-bold text-ink">Personal boards</h2>
              <p className="mt-1 text-base text-ink-muted">
                Boards created for your own work.
              </p>
            </div>
          </div>

          <div className="mt-4  flex flex-wrap gap-4 ">
            {personalBoards.map((board) => (
              <Link 
                key={board.id}
                to={`/board/${board.id}`}
                className={`group relative mt-3 flex h-36 w-52 flex-col rounded-md border border-paper-border p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${boardColors[board.id % boardColors.length]}`}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-14 -translate-x-1/2 rounded-sm border border-white/25 bg-[#e8c790]/75 shadow-sm ${board.id % 2 === 0 ? "rotate-2" : "-rotate-2"}`}
                />
                <div className= "flex items-start justify-between">
                <h3 className="text-xl font-semibold">{board.title}</h3> 
                <span className="text-2xl">{board.emoji}</span></div>
                <p className="mt-2 text-sm text-ink-muted">
                {board.description}</p>

                <p className="mt-auto font-semibold text-sm text-ink-muted">Open board →</p>
              </Link>
            ))}
           <div
  onClick={createPersonalBoard}
  className="
    flex h-36 w-52 cursor-pointer flex-col
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
</div>
        </div>
        </div>

       

          
          <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink">Workspaces</h2>
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
              <div
                key={membership.org.id}
                className={`group relative mt-3 flex h-40 w-72 flex-col rounded-md border border-paper-border p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${boardColors[membership.org.id % boardColors.length]}`}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-14 -translate-x-1/2 rounded-sm border border-white/25 bg-[#e8c790]/75 shadow-sm ${membership.org.id % 2 === 0 ? "rotate-2" : "-rotate-2"}`}
                />
                <h3 className="text-xl font-semibold">{membership.org.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  {membership.org.description}
                </p>
                <p className="mt-auto text-sm font-semibold text-ink-muted">
                  View boards →
                </p>
              </div>
            ))}
          </div>
      </div>
      </main>
      <div aria-hidden="true" className="pointer-events-none fixed bottom-9 right-12 z-10 h-32 w-72">
        <p className="absolute right-0 top-1 rotate-[-6deg] text-right font-handwritten text-2xl leading-7 text-ink-muted">
          Ideas become things<br />
          when you begin. <span className="text-accent">✦</span>
        </p>
        <svg
          className="absolute bottom-0 right-40 h-12 w-16 -rotate-6 text-ink-muted"
          viewBox="0 0 80 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 8C10 31 30 44 57 39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 31L59 39L49 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
export default Dashboard;
