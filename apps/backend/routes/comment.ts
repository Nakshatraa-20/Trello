import express from "express"
import prisma from "db/client"
import {authMiddleware} from "../middleware/auth"

const router= express.Router()
router.use(authMiddleware)

router.post("/comment",async(req,res)=>
{
      const issue= await prisma.issue.findFirst({
        where:{
            id: req.body.issueId
        }
      })

      if(!issue){
        return res.status(403).json({
            message:"issue not found"
        })
      }
      const board= await prisma.boards.findFirst({
        where:{
            id: issue.boardId
        }
      })
      if(!board)
      {
        return res.status(403).json({
            message:"board not found"
        })
      }
      const membership = await prisma.membership.findFirst({
        where: {
            userId: (req as any).userId,
            orgId: board.orgId,
        
        }
    })

    if(!membership)({
        message: "no membership found"
    })
    
    await prisma.comment.create({
        data:{
            id:req.body.commentId,
            content: req.body.comment,
            userId: (req as any).userId,
            issueId:req.body.issueId
        }
    })

})

router.delete("/delete-comment",async(req,res)=>{


  const issue= await prisma.issue.findFirst({
    where:{
        id: req.body.issueId
    }
  })

  if(!issue){
    return res.status(403).json({
        message:"issue not found"
    })
  }
  const board= await prisma.boards.findFirst({
    where:{
        id: issue.boardId
    }
})
  if(!board)
  {
    return res.status(403).json({
        message:"board not found"
    })
  }
  const membership = await prisma.membership.findFirst({
    where: {
        userId: (req as any).userId,
        orgId: board.orgId,
    
    }
})

if(!membership)({
    message: "no membership found"
})

await prisma.comment.delete({
    where: {
        id: req.body.commentId
    }
})

})

export default router