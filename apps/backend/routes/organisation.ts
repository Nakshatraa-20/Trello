import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";
import crypto from "crypto"

const router = express.Router();
router.use(authMiddleware);

router.post("/create-org", async (req, res) => {
  const organisation = await prisma.org.create({
    data: { name: req.body.name, description: req.body.description },
  });

  await prisma.membership.create({
    data: { userId: (req as any).userId, orgId: organisation.id, role: "admin" },
  });

  return res.status(201).json({ organisation });
});

router.get("/getorg", async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: (req as any).userId },
    include: { org: true },
  });

  return res.json({ memberships });
});

router.delete("/delete-org", async (req, res) => {
  const orgId = Number(req.body.orgId);
  const member = await prisma.membership.findFirst({
    where: { userId: (req as any).userId, orgId, role: "admin" },
  });

  if (!member) {
    return res.status(403).json({ message: "User cannot delete the organisation" });
  }

  await prisma.org.delete({ where: { id: orgId } });
  return res.status(204).send();
});

router.post("/:orgId/invite",async(req,res)=>
{
  const orgId= Number(req.params.orgId)
  const inviterId= (req as any).userId

  const username= req.body.username
  const email= req.body.email

  if (!username && !email) {
    return res.status(400).json({
      message: "Username or email is required",
    });
  }
  if(username && email){
    return res.status(400).json({
      message:"Provide either username or email,not both"
    })
  }
  const membership= await prisma.membership.findFirst({
    where:{
      userId: inviterId,
      orgId,
      role:"admin"
    }
  })

  if(!membership){
    return res.status(403).json({
      message:"you are not eligible to send the invitation"
    })
  }
  let invitedUser=null
  if(username){
     invitedUser= await prisma.user.findUnique({
         where:{
          username
         }
    })
    if(!invitedUser){
      return res.status(404).json({
        message:"User not found"
      })
    }
  }
      if(email){
        const normalisedEmail= email.trim().toLowerCase()
         invitedUser= await prisma.user.findUnique({
          where:{
            email:normalisedEmail
          }
        })
        if(invitedUser){
          const existingMembership= await prisma.membership.findFirst({
            where:{
              userId: invitedUser.id,
              orgId: orgId
            }
          })
        
        if (existingMembership) {
          return res.status(409).json({
            message: "User is already a member of this workspace",
          });
        }  
      }

      const existingInvitation= await prisma.invitation.findFirst({
        where:{
          orgId,
          status:"pending",

          ...(invitedUser?{userId: invitedUser.id}:{email:email.trim().toLowerCase()})
        }
      })
      if (existingInvitation) {
        return res.status(409).json({
          message: "An invitation has already been sent to this user",
        });
      }
    }
    const token= crypto.randomBytes(32).toString("hex")
   const expiresAt= new Date()
   expiresAt.setDate(expiresAt.getDate()+7)

   const invitation= await prisma.invitation.create({
    data:{
      orgId,
      invitedById: inviterId,
      userId: invitedUser? invitedUser.id : null,
      email: email? email.trim().toLowerCase():null,
      token,
      role:"member",
      status:"pending",
      expiresAt
    }
   })
   if(invitation){
    return res.status(403).json({
      message:"Invitation created successfully"
    })
   }
})


export default router;
