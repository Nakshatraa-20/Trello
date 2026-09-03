import "./index.css";
import { useEffect, useState , useRef} from "react";

/* interface Issue {
  id: number;
  title: string;
  boardId: number;
  sectionId: number;
}*/

interface Section{
  id: number;
  title:string;
  boardId:number;

}
function App(){
const [sections, setSections]= useState<Section[]>([])
const newSectionTitle= useRef<HTMLInputElement>(null)


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
  }

return (
  <div>
    <h1>Board</h1>
    <input
    ref={newSectionTitle} 
    placeholder="New Section Title"    
    />

    <button onClick= {createSection}>
      Create Section
    </button>
  
    <div style={{display:"flex", gap:20}}>
      {
        sections.map((section)=>(<div key={section.id}>
          <h2>{section.title}</h2></div>)
      )}
    </div>
  </div>
)

}

export default App