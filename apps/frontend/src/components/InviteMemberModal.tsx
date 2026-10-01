import {useRef} from "react"
type Props={
    orgId: number
    onClose: ()=> void
}
export default function InviteMemberModal({onClose, orgId}:Props){
    const inviteRef= useRef<HTMLInputElement>(null)
    const handleInvite=async () =>{
        const value= inviteRef.current?.value.trim()
        if(!value){
            return
        }
        const body= value.includes("@")?{email:value}:{username:value}
        console.log(body)
        const token= localStorage.getItem("token")
        if(!token){
            alert("please sign in again")
            return
        }
        const response= await fetch(`http://localhost:3001/invitation/${orgId}/invite`,{
            method:"POST",
            headers:{
            "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
            },
            body:JSON.stringify(body)
        })

        const data= await response.json()
        if(!response.ok){
            alert(data.message)
        }
        if(inviteRef.current){
            inviteRef.current.value=""
        }
        
    }
    
    return (
        <div>
            <h2>Invite member </h2>
            <input 
            ref={inviteRef}
            type="text"
            placeholder="username or email" />
            <button onClick={handleInvite}>
                Send Invite
            </button>
            <button onClick={onClose}>
        Close
      </button>
            

        </div>
    )
}






