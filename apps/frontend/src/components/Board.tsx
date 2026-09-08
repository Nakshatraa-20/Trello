import type {RefObject} from "react"
import Section from "./Section"



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
}

interface BoardProps {
  sections: SectionData[];
  issues: Issue[];
  newSectionTitle: RefObject<HTMLInputElement | null>;
  createSection: () => void;

  createIssue: (sectionId: number, title:string) => void;
  
  deleteIssue: (issueId: number) => void;
}

function Board({
  newSectionTitle,
  createSection,
  sections,
  issues,
  createIssue,
  
  deleteIssue

}: BoardProps) {
  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">

      
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          My Board
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Organize your work and keep everything moving.
        </p>
      </div>

      
      <div className="mb-8 flex items-center gap-3">
        <input
          ref={newSectionTitle}
          placeholder="New Section Title"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500/50 focus:bg-white/10"
        />

        <button
          onClick={createSection}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
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