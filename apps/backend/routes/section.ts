import express from "express"
import prisma from "db/client"
import {authMiddleware} from "../middleware/auth" 

const app= express()
app.use(authMiddleware)

app.post("post-issues",async(req,res)=>{
    const board= prisma.boards.findFirst({
        where:{
            boardId:req.body.boardId
        }
    })



const membership = await prisma.membership.findFirst({
    where: {
        userId: (req as any).userId,
        orgId: board.orgId
    }
})

if(!membership)({
    message: "no membership found"
})
      await prisma.issue.create({
        data:{
            title:req.body.title,
            boardId: board.id
        }
      })

})

app.post("/delete-section",async(req,res)=>{
    const board= prisma.boards.findFirst({
        where:{
            boardId:req.body.boardId
        }
    })



const membership = await prisma.membership.findFirst({
    where: {
        userId: (req as any).userId,
        orgId: board.orgId
    }
})

if(!membership)({
    message: "no membership found"
})

await prisma.section.deleteMany({
    where:{
        title:req.body.title
    }
})
})


