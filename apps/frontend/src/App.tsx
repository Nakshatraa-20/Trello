import "./index.css";
import { useEffect, useState , useRef} from "react";

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
const [issueTitle, setIssueTitle]= useState("")

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

  async function createIssue(sectionId: number) {
    const response = await fetch(
      "http://localhost:3001/issue/create-issue",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: issueTitle,
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
  


  return (
    <div>
      <h1>Board</h1>
  
      <input
        ref={newSectionTitle}
        placeholder="New Section Title"
      />
  
      <button onClick={createSection}>
        Create Section
      </button>
  
      <div style={{ display: "flex", gap: 20 }}>
        {sections.map((section) => (
          <div key={section.id}>
            <h2>{section.title}</h2>
  
            {issues
              .filter((issue) => issue.sectionId === section.id)
              .map((issue) => (
                <div key={issue.id}>
                  {issue.title}
                </div>
              ))}

              {<input 
               value= {issueTitle}  
               onChange={(e)=>setIssueTitle(e.target.value)}
               placeholder= "new Issue" />}

               <button onClick={() => createIssue(section.id)}> Create issue </button>
          </div>
        ))}
      </div>
    </div>
  )
}     



export default App