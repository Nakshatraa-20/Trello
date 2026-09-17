import type { RefObject } from "react";
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

  deleteIssue: (issueId: number) => void;
}

function Board({
  newSectionTitle,
  createSection,
  sections,
  issues,
  createIssue,

  deleteIssue,
}: BoardProps) {
  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Project space
        </p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
          My Board
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Organize your work and keep everything moving.
        </p>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <input
          ref={newSectionTitle}
          placeholder="New Section Title"
          className="rounded-xl border border-violet-400/20 bg-slate-950/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-400/60 focus:bg-slate-950/70"
        />

        <button
          onClick={createSection}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-violet-600/30"
        >
          + Create Section
        </button>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4">
        {sections.map((section) => (
          <Section
            key={section.id}
            section={section}
            issues={issues}
            createIssue={createIssue}

            deleteIssue={deleteIssue}
          />
        ))}
      </div>
    </main>
  );
}

export default Board;
