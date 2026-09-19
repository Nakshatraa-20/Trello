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
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
}

interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
  completed: boolean;
}

function Section({ section, issues, createIssue, deleteIssue , setIssues}: SectionProps) {
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

  async function moveIssue(issueId: number, newSectionId: number) {
   
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3001/issue/${issueId}/move`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sectionId: newSectionId,
        }),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      console.log(data.message);
      return;
    }

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, sectionId: newSectionId }
          : issue
      )
    );
  }

  const stickyColors = [
    "bg-sticky-yellow",
    "bg-sticky-pink",
    "bg-sticky-green",
    "bg-sticky-blue",
  ];

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        const issueId = Number(e.dataTransfer.getData("issueId"));
        moveIssue(issueId, section.id);
      }}

      className="w-72 shrink-0 rounded-md border border-paper-border bg-paper-dark p-4 shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink ">
          {section.title}
        </h2>
        <span className="rounded-full bg-paper-card px-2 py-1 text-xs font-medium text-ink-muted">
          {issues.filter((issue) => issue.sectionId === section.id).length}
        </span>
      </div>
      {issues
        .filter((issue) => issue.sectionId === section.id)
        .map((issue) => (
          <div
            key={issue.id}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("issueId", String(issue.id));
            }}
            className={`group relative mb-4  border border-paper-border  p-4 text-ink shadow-md transition-transform             
            ${stickyColors[issue.id % stickyColors.length]} duration-200 ${issue.id %2===0 ? "rotate-1" : "-rotate-1"} hover:rotate-0  hover:-translate-y-1` }
          >
            <input
              type="checkbox"
              checked={issue.completed}
              onChange={() => toggleCompleted(issue)}
            />
            <span>{issue.title} </span>

            
          </div>
        ))}
      <input
        type="text"
        ref={issueTitle}
        placeholder="Create an issue..."
        className="mb-2 w-full border-b-2 border-paper-border bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-ink-muted"
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
