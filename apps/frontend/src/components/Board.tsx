import type {RefObject} from "react"
     

  interface Section {
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
    sections: Section[];
    issues: Issue[]
    newSectionTitle: RefObject<HTMLInputElement | null>;
    createSection: () => void;
    createIssue:(sectionId: number)=>void 
    issueTitle: string
    setIssueTitle: (value: string) => void;
    deleteIssue: (issueId: number) => void;
  }


function Board({newSectionTitle, createSection,sections, issues,createIssue,issueTitle,setIssueTitle,deleteIssue}:BoardProps) {
    return (
        <main className= "mx-auto max-w-[1600px] px-6 py-10">
            <div className="mb-8">
                <h2 className= "text-3xl font-bold tracking-tight text-white" >My Board</h2>
                <p className= "mt-2 text-sm text-slate-400" ></p>
            </div>

        <div className= "mb-8 flex items-center gap-3"></div>
        <div className="flex gap-5 overflow-x-auto pb-4">
  {sections.map((section) => (
    
    <div key={section.id} className="w-72 shrink-0 rounded-2xl border border-2xl border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-black/50 backdrop-blur-sm shrink-0 ">
    <div className= "mb-4 flex items-centre justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider test-slate-300 mb-4">{section.title}</h2>
      <span className="rounded-xl py-2 bg-white/5 px-2 text-xs text-slate-500 items-centre">{issues.filter((issue)=>issue.sectionId===section.id).length}</span>
</div>
      {issues
        .filter((issue) => issue.sectionId === section.id)
        .map((issue) => (
          <div key={issue.id} className=" group relative mb-3 rounded-xl border border-white/10 rounded-2xl bg-slate-800/80 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-800 ">{issue.title}
          
          <span className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-violet-500 to-cyan-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </div>
        ))}
        <input 
  value={issueTitle}
  onChange={(e) => setIssueTitle(e.target.value)}
  placeholder="New issue"
  className=" mb-2 rounded-xl placeholder:text-slate-500 transition outline-none bg-white/5 boder-white/10 px-3 py-2.5 text-sm focus:border-violet-500/50 focus:bg-white/10"
/>
        <button className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition duration-200 hover:border-violet-500/30 hover:bg-white/10 hover:text-white" onClick= {()=> createIssue(section.id)}>
    Create Issue 
  </button>
  
    </div>
  ))}
  </div>
        </main>
    )
}

export default Board