type InviteMemberModalProps={
    orgId: number
    orgName: String
    onClose: ()=> void
}

export default function InviteMemberModal({
    orgId,
    orgName,
    onClose
}: InviteMemberModalProps) {
    return (
        <div>
        <h2>Invite your people ♡</h2>
  
        <p>
          Add someone to {orgName} by username or email.
        </p>
  
        <button onClick={onClose}>×</button>
      </div>
    )
}