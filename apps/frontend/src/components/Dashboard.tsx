import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Board {
  id: number;
  title: string;
  userId: number | null;
  orgId: number | null;
}

function Dashboard() {
  const [personalBoards, setPersonalBoards] = useState<Board[]>([]);
  const [workspaceBoards, setWorkspaceBoards] = useState<Board[]>([]);

  useEffect(() => {
    getPersonalBoards()
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <main className="mx-auto max-w-[1600px] px-6 py-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Personal Boards</h2>
          

          <div className="mt-4 flex flex-wrap gap-4 "></div>
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

        <button
          onClick={createPersonalBoard}
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 font-medium transition hover:bg-violet-500"
        >
          Create Board
        </button>
        <div className="mt-12">
  <h2 className="text-xl font-semibold">
    Workspaces
  </h2>

  <div className="mt-4 flex flex-wrap gap-4">
    {workspaceBoards.map((board) => (
      <Link
        key={board.id}
        to={`/board/${board.id}`}
        className="block w-64 rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg transition hover:border-violet-500/40 hover:bg-slate-900"
      >
        <h3 className="text-lg font-semibold">
          {board.title}
        </h3>
      </Link>
    ))}
  </div>
</div>
      </main>
    </div>
  );
}

export default Dashboard;
