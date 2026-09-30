import express from "express";
import prisma from "db/client";
import { authMiddleware } from "../middleware/auth";
import crypto from "crypto"


const router = express.Router();


router.post("/:orgId/invite",authMiddleware,async(req,res)=>
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
    
router.get("/me",authMiddleware,async(req,res)=>
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
        if(invitation.status !== "pending"){
            return res.status(400).json({
                message:"invitation is no longer valid"
            })
        }

        if(invitation.expiresAt < new Date()){
            return res.status(400).json({
                message:"invitation has expired"
            })
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

router.post("/:token/accept",authMiddleware,async(req,res)=>{
    const token= req.params.token as string
    const userId= (req as any).userId
    
    try{
        const invitation= await prisma.invitation.findUnique({
            where:{
                token
            }
        })

        if(!invitation){
            return res.status(404).json({
                message:"invitation not found"
            })
        }

        if(invitation.status!=="pending"){
            return res.status(404).json({
                message:"Invitation has expired"
            })
        }

        if(invitation.expiresAt < new Date()){
            return res.status(400).json({
                message:"invitation has expired"
            })
        }
        

        if(invitation.userId !==null){
            if(invitation.userId !== userId) 
            {
                return res.status(404).json({
                    message:"this invitation does not belong to you"
                })
            }
        }
        if(invitation.userId== null){
            const user= await prisma.user.findUnique({
                where:{
                    id: userId
                }
            })
            if(!user || user.email !== invitation.email){
               return res.status(404).json({
                message:"this invitation does not belong to you"
               })
            }
        }

        const existingMembership= await prisma.membership.findFirst({
            where:{
                userId,
                orgId: invitation.orgId
               
                
            }
    })
    if(existingMembership){
        return res.status(404).json({
            message:"you are already a member of this workspace"
        })

    }
    
    const [membership]= await prisma.$transaction([
        prisma.membership.create({
            data:{
              userId,
              orgId: invitation.orgId,
              role:"member"
            }
        }),
        prisma.invitation.update({
            where:{
                id: invitation.id,
            },
            data:{
                status:"accepted"
            }
        })

    ])

}
catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to accept invitation",
    });
  }
})
    


    
export default router