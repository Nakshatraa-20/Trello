import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Board from "./Board";

interface Board {
  id: number;
  title: string;
  userId: number | null;
  orgId: number | null;
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

    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3001/board/personal-board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
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

  return (
    <div className="min-h-screen bg-paper text-ink font-handwritten">
      <main className="mx-auto max-w-[1600px] px-6 py-10">
        <header className="mb-10">
          <h1 className="text-5xl font-bold text-ink">Your boards</h1>
          <div className="mt-3 h-1 w-20 -rotate-1 rounded-full bg-[#C96F6A]" />
          <p className="mt-2 text-lg text-ink-muted">
            Plan projects, organise work, and keep everything moving.
          </p>
        </header>
        <div>
          <div className="flex items-end justify-between border-b border-paer-border pb-3">
            <div>
              <h2 className="text-2xl font-bold text-ink">Personal boards</h2>
              <p className="mt-1 text-base text-ink-muted">
                Boards created for your own work.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 ">
            {personalBoards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="group block h-40 w-72 rounded-2xl border border-violet-400/25 bg-slate-800/95 p-6 shadow-lg shadow-black/30 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-slate-800 hover:shadow-xl"
              >
                <h3 className="text-xl font-semibold">{board.title}</h3>

                <p className="mt-2 text-sm text-slate-400">Open board →</p>
              </Link>
            ))}
            <div
              onClick={createPersonalBoard}
              className="flex h-36 w-64 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-paper-boder bg-paper-card text-ink-muted transition hover:-translate-y-1 hover:border-[#C96F6A]"
            >
              <div
                className="
      flex h-12 w-12 items-center justify-center
      rounded-full border-2 border-ink-muted
      text-3xl font-normal
    "
              >
                +
              </div>

              <span className="text-lg font-bold">Create Board</span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Workspaces</h2>
              <p className="mt-1 text-sm text-slate-400">
                Shared boards for your team and projects.
              </p>
            </div>
            <button
              onClick={createOrganization}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              + Create Workspace
            </button>
          </div>

          <div className="mt-6 space-y-10">
            {memberships.map((membership) => (
              <div key={membership.org.id}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {membership.org.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {membership.org.description}
                    </p>
                  </div>

                  <button
                    onClick={() => createWorkspaceBoards(membership.org.id)}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
                  >
                    + Create Board
                  </button>
                </div>

                <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
                  {workspaceBoards
                    .filter((board) => board.orgId === membership.org.id)
                    .map((board) => (
                      <Link
                        key={board.id}
                        to={`/board/${board.id}`}
                        className="group block h-40 w-72 shrink-0 rounded-2xl border border-violet-400/25 bg-slate-800/95 p-6 shadow-lg shadow-black/30 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-slate-800 hover:shadow-xl"
                      >
                        <h4 className="text-xl font-semibold">{board.title}</h4>

                        <p className="mt-2 text-sm text-slate-400">
                          Open board →
                        </p>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
