import { useRef, useState, type DragEvent } from "react";
import { API_URL } from "../config";

export interface DropTarget {
  sectionId: number;
  beforeIssueId: number | null;
}

interface SectionProps {
  section: {
    id: number;
    title: string;
    boardId: number;
  };
  issues: Issue[];
  createIssue: (sectionId: number, title: string) => void;
  draggedIssueId: number | null;
  onDragStart: (issueId: number) => void;
  dropTarget: DropTarget | null;
  onDropTargetChange: (target: DropTarget | null) => void;
  isMoving: boolean;
  moveIssue: (issueId: number, sectionId: number, beforeIssueId: number | null) => Promise<void>;
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
}

interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
  completed: boolean;
  position: number;
}

function Section({
  section,
  issues,
  createIssue,
  draggedIssueId,
  onDragStart,
  dropTarget,
  onDropTargetChange,
  isMoving,
  moveIssue,
  setIssues,
}: SectionProps) {
  const issueTitle = useRef<HTMLInputElement>(null);
  const [showIssueInput, setShowIssueInput] = useState(false);

  function handleCreateIssue() {
    const title = issueTitle.current?.value;
    if (!title) {
      return;
    }
    createIssue(section.id, title);
    setShowIssueInput(false);
  }

  async function toggleCompleted(issue: Issue) {
    const newCompletedValue = !issue.completed;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/issue/${issue.id}/completed`,
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

  const sectionIssues = issues
    .filter((issue) => issue.sectionId === section.id)
    .sort((a, b) => a.position - b.position || a.id - b.id);

  function getInsertionTarget(issue: Issue, event: DragEvent<HTMLDivElement>) {
    const remainingIssues = sectionIssues.filter((item) => item.id !== draggedIssueId);
    const targetIndex = remainingIssues.findIndex((item) => item.id === issue.id);
    const bounds = event.currentTarget.getBoundingClientRect();
    const droppedAbove = event.clientY < bounds.top + bounds.height / 2;
    return droppedAbove ? issue.id : remainingIssues[targetIndex + 1]?.id ?? null;
  }

  const isDropSection = dropTarget?.sectionId === section.id;

  const stickyColors = [
    "bg-sticky-yellow",
    "bg-sticky-pink",
    "bg-sticky-green",
    "bg-sticky-blue",
  ];

  return (
    <div
      onDragOver={(e) => {
        if (draggedIssueId === null || isMoving) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDropTargetChange({ sectionId: section.id, beforeIssueId: null });
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && isDropSection) {
          onDropTargetChange(null);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedIssueId === null || isMoving) return;
        void moveIssue(draggedIssueId, section.id, null);
      }}

      className="relative mt-5 w-72 shrink-0 rounded-md border border-paper-border bg-paper-dark p-4 shadow-md"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-4 left-1/2 z-10 h-7 w-24 -translate-x-1/2 rounded-sm border border-white/25 bg-[#e8c790]/75 shadow-sm ${section.id % 2 === 0 ? "rotate-2" : "-rotate-2"}`}
      />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-ink font-handwritten">
          {section.title}
        </h2>
        <span className="rounded-full bg-paper-card px-2 py-1 text-xs font-medium text-ink-muted">
          {sectionIssues.length}
        </span>
      </div>
      {sectionIssues.map((issue) => (
          <div
            key={issue.id}
            draggable={!isMoving}
            onDragStart={(e) => {
              if (isMoving) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("issueId", String(issue.id));
              onDragStart(issue.id);
            }}
            onDragOver={(e) => {
              if (draggedIssueId === null || isMoving) return;
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              onDropTargetChange(draggedIssueId === issue.id ? null : {
                sectionId: section.id,
                beforeIssueId: getInsertionTarget(issue, e),
              });
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (draggedIssueId === null || isMoving || draggedIssueId === issue.id) return;
              void moveIssue(draggedIssueId, section.id, getInsertionTarget(issue, e));
            }}
            className={`group relative mb-4  border border-paper-border px-4 py-3 text-ink shadow-md transition-transform             
            ${stickyColors[issue.id % stickyColors.length]} duration-200 ${draggedIssueId !== null ? "rotate-0" : `${issue.id % 2 === 0 ? "rotate-1" : "-rotate-1"} hover:rotate-0 hover:-translate-y-1`} ${draggedIssueId === issue.id ? "opacity-40" : ""} ${isMoving ? "cursor-wait" : "cursor-grab active:cursor-grabbing"}`}
          >
            {isDropSection && dropTarget.beforeIssueId === issue.id && (
              <div aria-hidden="true" className="pointer-events-none absolute -top-3 left-0 right-0 h-1 rounded-full bg-[#C96F6A]" />
            )}
            <div className="flex items-center gap-5">
              <input
                type="checkbox"
                checked={issue.completed}
                onChange={() => toggleCompleted(issue)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer"
              />
              <span
                className={
                  issue.completed
                    ? "text-base text-ink-muted/60 line-through"
                    : "text-base text-ink-muted"
                }
              >
                {issue.title}{" "}
              </span>
            </div>
          </div>
        ))}
      <div className="relative min-h-3">
        {isDropSection && dropTarget.beforeIssueId === null && (
          <div aria-hidden="true" className="pointer-events-none absolute -top-1 left-0 right-0 h-1 rounded-full bg-[#C96F6A]" />
        )}
        {sectionIssues.length === 0 && draggedIssueId !== null && (
          <p className="rounded border border-dashed border-paper-border px-3 py-5 text-center text-ink-muted">Drop task here</p>
        )}
      </div>
      {showIssueInput ? (
        <div className="mt-2">
          <input
            type="text"
            ref={issueTitle}
            autoFocus
            placeholder="Write a new note"
            className="mb-2 w-full border-b-2 border-paper-border bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateIssue}
              className="text-sm font-medium text-accent transition hover:text-ink"
            >
              Add note
            </button>
            <button
              onClick={() => setShowIssueInput(false)}
              className="text-sm font-medium text-ink-muted transition hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowIssueInput(true)}
          className="mt-1 text-sm font-medium text-ink-muted transition hover:text-accent"
        >
          + Add note
        </button>
      )}
    </div>
  );
}

export default Section;
