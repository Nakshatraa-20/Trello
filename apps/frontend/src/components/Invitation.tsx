import {useEffect, useState} from "react"
type Invitation={
    id:number
    token:string;
    role:string;
    status:string;
    org:{
        id:number;
        name:string;
    }
    invitedBy:{
        id:number;
        username:string
    }
}

export default function Invitations(){
    const [invitations, setInvitations]= useState<Invitation[]>([])
    useEffect(()=>{
        const fetchInvitations= async()=>{
        const token= localStorage.getItem("token")
        if(!token){
            return
        }
        const response= await fetch("http://localhost:3001/invitation/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data= await response.json()
        if(!response.ok){
            console.log(data.message)
            return
        }
        setInvitations(data.invitations)
    }
        fetchInvitations()
},[])

      const handleAccept= async (invitationToken:string)=>{
        const token= localStorage.getItem("token")
        if(!token){
            return
        }
        const response= await fetch(`http://localhost:3001/invitation/${invitationToken}/accept`,{
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
      })
         const data= await response.json()
         if (!response.ok) {
            alert(data.message);
            return;
          }
        
          alert("Workspace joined successfully!");
        
      }



      return (
    <div>
      <h2>Invitations</h2>

      {invitations.map((invitation) => (
        <div key={invitation.id}>
          <h3>{invitation.org.name}</h3>

          <p>
            {invitation.invitedBy.username} invited you to join
            this workspace.
          </p>
          <button onClick={()=> handleAccept(invitation.token)}>Accept</button>
        </div>
      ))}
    </div>
  );
}