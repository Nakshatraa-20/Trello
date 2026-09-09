import "./index.css";
import { useEffect, useState , useRef} from "react";
import Navbar from "./components/Navbar";
import Board from "./components/Board"
import { SignupForm } from "./components/signup-form";
import {LoginForm} from "./components/login-form"
import BoardPage from "./components/BoardPage"

import {BrowserRouter, Routes, Route} from "react-router-dom"

function App(){
  return (
      
    <BrowserRouter>
    <Routes>
      <Route path= "/signup"  element= {<SignupForm />} />
      <Route path= "/login"   element={<LoginForm />}  />
      <Route path= "/board"   element={<BoardPage />} />

    </Routes>
      </BrowserRouter>
    
    /*<div className="min-h-screen  bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white" >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
  <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
  <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
</div>
      <Navbar />
      <Board newSectionTitle={newSectionTitle}
              createSection= {createSection}  
              sections = {sections}
              issues={issues}
              createIssue={createIssue} 
              deleteIssue= {deleteIssue} />             
      </div>) */
)}
              
        
      
    
     



export default App