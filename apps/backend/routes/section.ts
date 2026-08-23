import express from "express"
import prisma from "db/client"

const app= express()

app.post("post-issues",authmiddleware,async(req,res)=>{
    const board= prisma.board.findFirst({
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

app.post("/delete-section",authmiddleware,async(req,res)=>{
    const board= prisma.board.findFirst({
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

await prisma.section.delete({
    where:{
        title:req.body.title
    }
})
})


