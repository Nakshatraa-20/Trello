import express from "express"
import prisma from "db/client"
import {authMiddleware} from "../middleware/auth" 

const router= express.Router()
router.use(authMiddleware)

router.post("/post-section",async(req,res)=>{
    const board= await prisma.boards.findFirst({
        where:{
            id:req.body.boardId
        }
    })

      if(!board){
        return res.status(403).json({
            message:" board not found"
        })
      }

const membership = await prisma.membership.findFirst({
    where: {
        userId: (req as any).userId,
        orgId: board.orgId
    }
})


if(!membership)({
    message: "no membership found"
})


      await prisma.section.create({
        data:{
            
            title:req.body.title,
            boardId: board.id
        }
      })

})

router.post("/delete-section",async(req,res)=>{
    const board= await prisma.boards.findFirst({
        where:{
            id:req.body.boardId
        }
    })
   
      if(!board){
        return res.status(403).json({
            message:" board not found"
        })
      }

const membership = await prisma.membership.findFirst({
    where: {
        userId: (req as any).userId,
        orgId: board.orgId
    }
})


if(!membership)({
    message: "no membership found"
})



await prisma.section.delete({
    where:
    {
        id:req.body.sectionId
    }

})
})

router.get("/section/:boardId", async(req,res)=>
{
    const board= await prisma.boards.findFirst({
        where:{
            id:Number(req.params.boardId)
        }
    })

      if(!board){
        return res.status(403).json({
            message:" board not found"
        })
      }

const membership = await prisma.membership.findFirst({
    where: {
        userId: (req as any).userId,
        orgId: board.orgId
    }
})


if(!membership)({
    message: "no membership found"
})

const sections=await prisma.section.findMany({
    where:{
        boardId: board.id
    }
})

res.json(sections)

})

export default router



