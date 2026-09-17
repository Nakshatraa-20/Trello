import { useRef, useState } from "react";
interface SectionProps {
  section: {
    id: number;
    title: String;
    boardId: Number;
  };
  issues: Issue[];
  createIssue: (sectionId: number, title: string) => void;
  deleteIssue: (issueId: number) => void;
}

interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
  completed: boolean;
}
const [issues, setIssues] = useState<Issue[]>([]);

function Section({ section, issues, createIssue, deleteIssue }: SectionProps) {
  const issueTitle = useRef<HTMLInputElement>(null);

  function handleCreateIssue() {
    const title = issueTitle.current?.value;
    if (!title) {
      return;
    }
    createIssue(section.id, title);
  }

  async function toggleCompleted(issue: Issue) {
    const newCompletedValue = !issue.completed;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3001/issue/${issue.id}/completed`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: newCompletedValue,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      console.log(data.message);
      return;
    }
    setIssues((prev) =>
      prev.map((currentIssue) =>
        currentIssue.id === issue.id
          ? { ...currentIssue, completed: newCompletedValue }
          : currentIssue,
      ),
    );
  }

  return (
    <div className="w-72 shrink-0 rounded-2xl border border-violet-400/20 bg-slate-800/95 p-4 shadow-xl shadow-black/30 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
          {section.title}
        </h2>
        <span className="rounded-xl bg-slate-950/70 px-2 py-1 text-xs font-medium text-violet-200">
          {issues.filter((issue) => issue.sectionId === section.id).length}
        </span>
      </div>
      {issues
        .filter((issue) => issue.sectionId === section.id)
        .map((issue) => (
          <div
            key={issue.id}
            className="group relative mb-3 rounded-xl border border-slate-700/80 bg-slate-950/70 p-4 text-slate-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-slate-950"
          >
            <input
              type="checkbox"
              checked={issue.completed}
              onChange={() => toggleCompleted(issue)}
            />
            <span>{issue.title} </span>

            <span className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-violet-500 to-cyan-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </div>
        ))}
      <input
        type="text"
        ref={issueTitle}
        placeholder="Create an issue..."
        className="mb-2 w-full rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-400/60 focus:bg-slate-950"
      />

      <button
        onClick={handleCreateIssue}
        className="w-full rounded-xl border border-violet-400/25 bg-slate-950/45 px-3 py-2 text-sm font-medium text-violet-100 transition duration-200 hover:border-violet-400/45 hover:bg-slate-950/70"
      >
        Create Issue
      </button>
    </div>
  );
}

export default Section;
