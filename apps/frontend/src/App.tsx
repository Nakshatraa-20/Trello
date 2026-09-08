import "./index.css";
import { useEffect, useState , useRef} from "react";
import Navbar from "./components/Navbar";
import Board from "./components/Board"
import { SignupForm } from "./components/signup-form";

 interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
}

interface Section{
  id: number;
  title:string;
  boardId:number;

}
function App(){
const [sections, setSections]= useState<Section[]>([])
const newSectionTitle= useRef<HTMLInputElement>(null)

const [issues, setIssues]= useState<Issue[]>([])
const [issueTitle, setIssueTitle]= useState<Record<number, string>>({})

useEffect(()=>{

  async function getSections(){
    try{
      const response = await fetch("http://localhost:3001/section/1")
      const data= await response.json()

      setSections(data.sections)


    }
    catch(error){
      console.error("error fetching sections", error)
    }
  }
  getSections()

  async function getIssues(){

    const response= await fetch("http://localhost:3001/issue/issues/board/1")
    const data= await response.json()
    setIssues(data.issues)
  }
  getIssues()
  },[])

     


  async function createSection(){
    const title= newSectionTitle.current?.value 

    const response= await fetch("http://localhost:3001/section/post-section",{
      method:"POST", 
      headers: {
        "Content-type":"application/json"
      },
      body: JSON.stringify({
        title:title,
        boardId:1
      })
         
    })

    const data= await response.json()
    if (!response.ok) {
      console.error(data.message);
      return;
    }

    setSections((prev)=>[...prev, data.section])
    newSectionTitle.current!.value=""
  }

  async function createIssue(sectionId: number, title: string) {
    const response = await fetch(
      "http://localhost:3001/issue/create-issue",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          description: "",
          boardId: 1,
          sectionId: sectionId,
        }),
      }
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      console.error(data.message);
      return;
    }
  
    setIssues((prev) => [...prev, data.issue]);
    setIssueTitle("");
  }
  async function deleteIssue(issueId: number) {
    const response = await fetch(
      `http://localhost:3001/issue/${issueId}`,
      {
        method: "DELETE",
      }
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      console.error(data.message);
      return;
    }
  
    setIssues((prev) =>
      prev.filter((issue) => issue.id !== issueId)
    );
  }
  


  return (

    <SignupForm />
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