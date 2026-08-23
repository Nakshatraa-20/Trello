import express from "express"
import prisma from "db/client"

const app= express()

app.post("/create-issue",authmiddleware,async(req,res)=>{
    
        const board= await prisma.board.findUnique({
            where:{
                id:req.body.boardId
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
                    description:req.body.description,
                    boardId: board.Id,
                    sectionId:
                 }
        })

        res.json({
            message:"issue created successfully"
        })
    })
    
    app.post("")
    

        
    

