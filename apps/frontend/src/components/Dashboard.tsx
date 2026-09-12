import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

    const response = await fetch("http://localhost:3001/organisation/create-org", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data.message);
      return;
    }

    console.log(data.organisation);
    await getWorkspaceOrganisations()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <main className="mx-auto max-w-[1600px] px-6 py-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Personal Boards</h2>

          <div className="mt-4 flex flex-wrap gap-4 ">
            {personalBoards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="block w-64 rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg transition hover:border-violet-500/40"
              >
                <h3 className="text-lg font-semibold">{board.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={createPersonalBoard}
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 font-medium transition hover:bg-violet-500"
        >
          Create Board
        </button>
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workspaces</h2>
            <button
              onClick={createOrganization}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
            >
              + Create Workspace
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            {memberships.map((membership) => (
              <div
                key={membership.org.id}
                className="w-64 rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg"
              >
                <h3 className="text-lg font-semibold">{membership.org.name}</h3>

                <p className="mt-1 text-sm text-slate-400">
                  {membership.org.description}
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  Role: {membership.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
