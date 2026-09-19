import { useState, type RefObject } from "react";
import Section from "./Section";

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
  completed: boolean
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
  deleteIssue,
}: BoardProps) {
  const [showSectionInput, setShowSectionInput] = useState(false);

  function handleCreateSection() {
    if (!newSectionTitle.current?.value.trim()) {
      return;
    }

    createSection();
    setShowSectionInput(false);
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-10 flex justify-between 
      gap-6 ">
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

        <div className="mb-8 flex items-center justify-end gap-3">
        {showSectionInput ? (
          <>
            <input
              ref={newSectionTitle}
              autoFocus
              placeholder="New Section Title"
              className="w-64 border-b-2 border-paper-border bg-transparent px-2 py-2 text-lg text-ink outline-none placeholder:text-ink-muted focus:border-accent"
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

      

      <div className="flex gap-5 overflow-x-auto pb-4">
        {sections.map((section) => (
          <Section
            key={section.id}
            section={section}
            issues={issues}
            createIssue={createIssue}
             setIssues= {setIssues}
            deleteIssue={deleteIssue}
          />
        ))}
      </div>
    </main>
  );
}

export default Board;
