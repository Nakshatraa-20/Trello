import { Search } from "lucide-react";

function Navbar() {
    return ( <header className="h-16 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white backdrop-blur-xl">
    <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6">
        <div className= "flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 ">+</div>
    
    <div>
        <h1 className="text-lg font-bold tracking-tight">
            FlowBoard
        </h1>
        <p className=" text-[16px] font-medium uppercase tracking-[0.2em] text-slate-500 ">
            Workspace
        </p>

    </div>
    </div>
    <div className= "flex items-center gap-3"> 
    <div className="group relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
  <Search size={16} className="text-slate-500" />

  <input
    type="text"
    placeholder="Search..."
    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
  />

  <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-violet-500 to-cyan-400 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100" />
</div>
    <button className="relative rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500  px-4 py-2 text-sm text-white shadow-lg shadow-violet-600/20 hover:shadow-xl tansition duration-200 hover:-translate-y-0.5 hover:shadow-xl ">
  Create

  
</button>
    </div>
    </div>

    </header>
        
    )
}

export default Navbar