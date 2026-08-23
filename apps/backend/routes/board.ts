import express from "express"
import {prisma} from "db/client"
import { authMiddleawre } from "../middleware/auth"

const app= express()

app.use(authMiddleawre)

app.post("/board-post",authmiddleware,async(req,res)=>
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

app.get("/boards",authmiddleware,async(req,res)=>
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

app.delete("/boards-delete",authmiddleware,async(req,res)=>
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

 await prisma.boards.delete({
    where:{
        orgId:req.body.orgId
    }
 })


}
)

app.delete("/board-delete",authmiddleware,async(req,res)=>
{
   const membership= prisma.membership.findFirst({
      where:{
         orgId:req.body.orgId,
         userId:req.body.userId
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




