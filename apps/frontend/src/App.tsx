import "./index.css";
import { useEffect, useState } from "react";

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

return (
  <div>
    <h1>Board</h1>
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