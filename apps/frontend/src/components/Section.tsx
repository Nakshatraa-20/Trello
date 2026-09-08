import {useRef} from "react"
interface SectionProps{
    section:{
        id: number
        title: String
        boardId: Number
    }
    issues: Issue[]
    createIssue: (sectionId: number, title: string) => void;
    deleteIssue: (issueId: number) => void;
}

interface Issue {
    id: number;
    title: string;
    boardId: number;
    sectionId: number;
  }


function Section({section,issues,createIssue, deleteIssue}:SectionProps){

    const issueTitle = useRef<HTMLInputElement>(null);

    function handleCreateIssue(){
        const title= issueTitle.current?.value
        if(!title){
            return 
        }
             createIssue(section.id, title)
    }




    return ( <div className="w-72 shrink-0 rounded-2xl border border-2xl border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-black/50 backdrop-blur-sm shrink-0 ">
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
          ref={issueTitle}
          type="text"
          placeholder="Create an issue..."
         className="mb-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500/50 focus:bg-white/10"
          />
            
        <button
        onClick={handleCreateIssue}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition duration-200 hover:border-violet-500/30 hover:bg-white/10 hover:text-white"
      >
         Create Issue
      </button>
      </div>
         
        )}

export default Section