import {useState} from "react"
import {useParams} from "react-router-dom"
import InviteMemberModal from "./InviteMemberModal"


export default function WorkspacePage(){
  const [inviteOpen, setInviteOpen]= useState(false)
    const {orgId}= useParams()

    return (
        <div>
      <button onClick={() => setInviteOpen(true)}>
        Invite
      </button>

      {inviteOpen && 
          <InviteMemberModal
          onClose={()=> setInviteOpen(false)}
          orgId= {Number(orgId)} />
        }
    </div>
    )
}