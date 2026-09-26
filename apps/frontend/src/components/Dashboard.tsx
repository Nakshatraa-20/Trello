import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pin } from "lucide-react";
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
              <div className="inline-block -rotate-1">
                <div
                  className="border border-paper-border bg-board-rose px-5 py-1.5 shadow-sm"
                  style={{ clipPath: "polygon(0 0,100% 0,100% 8%,96% 12%,100% 16%,96% 20%,100% 24%,96% 28%,100% 32%,96% 36%,100% 40%,96% 44%,100% 48%,96% 52%,100% 56%,96% 60%,100% 64%,96% 68%,100% 72%,96% 76%,100% 80%,96% 84%,100% 88%,96% 92%,100% 96%,100% 100%,0 100%,0 96%,4% 92%,0 88%,4% 84%,0 80%,4% 76%,0 72%,4% 68%,0 64%,4% 60%,0 56%,4% 52%,0 48%,4% 44%,0 40%,4% 36%,0 32%,4% 28%,0 24%,4% 20%,0 16%,4% 12%,0 8%,4% 4%,0 0)" }}
                >
                  <h2 className="text-3xl font-bold text-ink">Personal boards</h2>
                </div>
              </div>
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
                className={`group relative mt-3 flex h-40 w-60 flex-col rounded-md border border-paper-border p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${board.id % 2 === 0 ? "rotate-[0.5deg]" : "-rotate-[0.5deg]"} ${boardColors[board.id % boardColors.length]}`}
              >
                <CardAttachment id={board.id} />
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
</div>
        </div>
        </div>

       

          
          <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-block rotate-[0.5deg]">
                <div
                  className="border border-paper-border bg-board-sage px-5 py-1.5 shadow-sm"
                  style={{ clipPath: "polygon(0 0,100% 0,100% 8%,96% 12%,100% 16%,96% 20%,100% 24%,96% 28%,100% 32%,96% 36%,100% 40%,96% 44%,100% 48%,96% 52%,100% 56%,96% 60%,100% 64%,96% 68%,100% 72%,96% 76%,100% 80%,96% 84%,100% 88%,96% 92%,100% 96%,100% 100%,0 100%,0 96%,4% 92%,0 88%,4% 84%,0 80%,4% 76%,0 72%,4% 68%,0 64%,4% 60%,0 56%,4% 52%,0 48%,4% 44%,0 40%,4% 36%,0 32%,4% 28%,0 24%,4% 20%,0 16%,4% 12%,0 8%,4% 4%,0 0)" }}
                >
                  <h2 className="text-3xl font-bold text-ink">Workspaces</h2>
                </div>
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
              <div
                key={membership.org.id}
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
