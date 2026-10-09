import { useRef, useState, type RefObject } from "react";
import Section, { type DropTarget } from "./Section";

interface SectionData {
  id: number;
  title: string;
  boardId: number;
}

interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
  completed: boolean;
  position: number;
}

interface BoardProps {
  sections: SectionData[];
  issues: Issue[];
  newSectionTitle: RefObject<HTMLInputElement | null>;
  createSection: () => void;

  createIssue: (sectionId: number, title: string) => void;
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>
  deleteIssue: (issueId: number) => void;
}

function Board({
  newSectionTitle,
  createSection,
  sections,
  issues,
  createIssue,
  setIssues,
}: BoardProps) {
  const [showSectionInput, setShowSectionInput] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  const moveInFlight = useRef(false);

  function updateDropTarget(target: DropTarget | null) {
    setDropTarget((previous) =>
      previous?.sectionId === target?.sectionId &&
      previous?.beforeIssueId === target?.beforeIssueId
        ? previous
        : target,
    );
  }

  function endDrag() {
    setDraggedIssueId(null);
    setDropTarget(null);
  }

  async function moveIssue(
    issueId: number,
    sectionId: number,
    beforeIssueId: number | null,
  ) {
    endDrag();
    if (moveInFlight.current || !issues.some((issue) => issue.id === issueId)) {
      return;
    }

    moveInFlight.current = true;
    setIsMoving(true);
    setMoveError(null);

    try {
      const response = await fetch(`http://localhost:3001/issue/${issueId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ sectionId, beforeIssueId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Could not move the task. Please try again.");
      }
      if (!Array.isArray(data.issues)) {
        throw new Error("The server did not return the saved order. Please refresh the board.");
      }

      const updatedById = new Map<number, Issue>(
        data.issues.map((issue: Issue) => [issue.id, issue]),
      );
      setIssues((previous) => previous.map((issue) => {
        const updated = updatedById.get(issue.id);
        // A move must not overwrite a checkbox changed while the request ran.
        return updated
          ? { ...issue, sectionId: updated.sectionId, position: updated.position }
          : issue;
      }));
    } catch (error) {
      setMoveError(error instanceof Error ? error.message : "Could not move the task.");
    } finally {
      moveInFlight.current = false;
      setIsMoving(false);
    }
  }

  function handleCreateSection() {
    if (!newSectionTitle.current?.value.trim()) {
      return;
    }

    createSection();
    setShowSectionInput(false);
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
       <div> <p className="text-lg font-medium text-ink-muted">
          Project space
        </p>
        <h2 className="mt-2 text-4xl font-bold text-ink">
          My Board
        </h2>
        <div className="mt-3 h-1 w-30 -rotate-1 rounded-full bg-accent" />

        <p className="mt-2 text-lg text-ink-muted">
          Plan. Build. Launch.
        </p>
        </div>

      <aside className="pointer-events-none relative hidden h-36 w-32 shrink-0 -rotate-3 border border-paper-border bg-paper-card/95 p-4 shadow-md lg:block">
        <div className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 rounded-sm border border-white/25 bg-[#e8c790]/75" />
        <p className="font-handwritten text-2xl leading-7 text-ink">
          Good<br />
          things<br />
          take time <span className="text-accent">♥</span>
        </p>
      </aside>
        <div className="mb-8 flex max-w-full flex-wrap items-center justify-end gap-3">
        {showSectionInput ? (
          <>
            <input
              ref={newSectionTitle}
              autoFocus
              placeholder="New Section Title"
              className="w-64 max-w-full border-b-2 border-paper-border bg-transparent px-2 py-2 text-lg text-ink outline-none placeholder:text-ink-muted focus:border-accent"
            />
            <button
              onClick={handleCreateSection}
              className="border border-paper-border bg-[#C96F6A] px-4 py-2 text-lg font-medium text-ink shadow-sm transition hover:-translate-y-0.5"
            >
              Add Section
            </button>
            <button
              onClick={() => setShowSectionInput(false)}
              className="px-2 text-sm font-medium text-ink-muted transition hover:text-ink"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowSectionInput(true)}
            className="border border-paper-border bg-[#C96F6A] px-4 py-2 text-lg font-medium text-ink shadow-sm transition hover:-translate-y-0.5"
          >
            + Create Section
          </button>
        )}
      </div>


      </div>

      

      <p role="status" className="min-h-6 text-sm text-ink-muted">
        {isMoving ? "Saving task order…" : "Drag a task above or below another task to move it."}
      </p>
      {moveError && <p role="alert" className="mb-3 text-base text-red-800">{moveError}</p>}
      <div className="flex gap-5 overflow-x-auto pb-4" onDragEnd={endDrag}>
        {sections.map((section) => (
          <Section
            key={section.id}
            section={section}
            issues={issues}
            createIssue={createIssue}
             setIssues= {setIssues}
            draggedIssueId={draggedIssueId}
            onDragStart={(issueId) => {
              if (moveInFlight.current) return;
              setMoveError(null);
              setDraggedIssueId(issueId);
            }}
            dropTarget={dropTarget}
            onDropTargetChange={updateDropTarget}
            isMoving={isMoving}
            moveIssue={moveIssue}
          />
        ))}
      </div>
    </main>
  );
}

export default Board;
