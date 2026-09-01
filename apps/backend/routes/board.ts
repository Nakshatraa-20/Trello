import express from "express"
import prisma from "db/client"
import { authMiddleware} from "../middleware/auth"

const router= express.Router()

router.use(authMiddleware)

router.post("/board-post",async(req,res)=>
{
    const membership= prisma.membership.findFirst({
             where:{
                orgId:req.body.orgId,
                userId:(req as any).userId
             }
    })
  
     if(!membership)
     {
        res.status(403).json({
            message:"not a member of the org"
        })
     }

     await prisma.boards.create({
        data:{
            title:req.body.title,
            orgId: req.body.orgId
        }
     })
     res.json({
        message:"board created successfully"
     })

})

router.get("/boards",async(req,res)=>
{
    const membership= prisma.membership.findFirst({
        where:{
           orgId:req.body.orgId,
           userId:(req as any).userId
        }
})

if(!membership)
{
   res.status(403).json({
       message:"not a member of the org"  
   })
}
    
     await prisma.boards.findMany({
        where:
        {
            orgId: req.body.orgId
        }
     })
})

router.delete("/boards-delete",async(req,res)=>
{
    const membership= prisma.membership.findFirst({
        where:{
           orgId:req.body.orgId,
           userId:(req as any).userId,
           role:"admin"
        }
})

if(!membership)
{
   res.status(403).json({
       message:"not a member of the org"
   })
}

 await prisma.boards.deleteMany({
    where:{
        orgId:req.body.orgId
        
        
    }
 })


}
)

router.delete("/board-delete",async(req,res)=>
{
   const membership= prisma.membership.findFirst({
      where:{
         orgId:req.body.orgId,
         userId:(req as any).userId
      }
   })

   if(!membership){
      return res.status(403).json({
         message:"not a member of the org"
      })
   }

   const board = await prisma.boards.findFirst({
      where: {
         id:req.body.boardId,
         orgId: req.body.orgId
      }
   })
})

export default router

