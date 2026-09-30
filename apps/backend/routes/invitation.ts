import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";
import crypto from "crypto"


const router = express.Router();
router.use(authMiddleware)

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
    
router.get("/me",async(req,res)=>
{
    const userId= (req as any).userId
    try{
        const invitations= await prisma.invitation.findMany({
            where:{
                userId,
                status:"pending"
            },
            include:{
                org: true,
            
            invitedBy:{
                select:{
                    id:true,
                    username:true

                }
            }
            }
        })
    
        return res.status(200).json({
            invitations,
        })
    }
    catch (error) {
        console.error(error);
    
        return res.status(500).json({
          message: "Failed to fetch invitations",
        });
}
}
)

router.get("/:token", async(req,res)=>
{
    const token= req.params.token
    try{
        const invitation= await prisma.invitation.findUnique({
            where:{
                token,
            },
            include:{
                org:true,
                invitedBy:{
                    select:{
                        id:true,
                        username:true,
                    }
                }
            }

        })
        if (!invitation) {
            return res.status(404).json({
              message: "Invitation not found",
            });
          }
          return res.status(200).json({
            invitation,
          })
        } catch (error) {
            console.error(error);
        
            return res.status(500).json({
              message: "Failed to fetch invitation",
            });
          }
        });
    
export default router