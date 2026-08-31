import express from "express"
import prisma from "db/client"
import {authMiddleware} from "../middleware/auth"

const app= express()
app.use(authMiddleware)

app.post("/create-issue",async(req,res)=>{
    
        const board= await prisma.boards.findUnique({
            where:{
                id:req.body.boardId
            }
        })

        if(!board){
            return res.status(403).json({
                message:"board not found"
            })
        }

        const section= await prisma.section.findUnique({
            where: {
                id: req.body.sectionId
            }
        })

        if(!section)
        {
            return res.status(403).json({
                message:"section not found"
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
        await prisma.issue.create({
                 data:{
                    title:req.body.title,
                    description:req.body.description,
                    boardId: board.id,
                    sectionId: section.id
                 }
        })

        res.json({
            message:"issue created successfully"
        })
    })
    
    app.get("/issues/board/:boardId", async(req,res)=>
        {
    const boardId= Number(req.params.boardId)
        const board= await prisma.boards.findUnique({
            where:{
                id:boardId
            }
        })

        if(!board){
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

        const issues=await prisma.issue.findMany({
            where:
            {
                boardId:board.id
            }
        })
          
        res.json(issues )
    })

    app.get("/issues/section/:sectionId", async(req,res)=> {
        const section= await prisma.section.findFirst({
            where:{
                id:Number(req.params.sectionId)
            }
        })

        if(!section){
            return res.status(403).json({
                message:"section not found"
            })
        }
      
        const board = await prisma.boards.findFirst({
            where: {
                id: section.boardId
            }
        })

       if(!board){
        return res.status(403).json({
            message:"board not found "
        })
       }
       const membership = await prisma.membership.findFirst({
        where: {
            userId: (req as any).userId,
            orgId: board.orgId
        }
    })
   if(!membership){
    return res.status(403).json({
        message: "not a member of this organization"
    })
}

   const issues=await prisma.issue.findMany({
    where:{
        boardId:board.id,
        sectionId:section.id
    }
   })

  res.json(issues)
    
      
    })
   

    app.get("/issue/:issueId", async(req,res)=>{
             
        const issue= await prisma.issue.findFirst({
            where:{
                id: Number(req.params.issueId)
            }
        })

        if(!issue){
            return res.status(403).json({
                message:"issue not found"
            })
        }
        const section= await prisma.section.findFirst({
            where:{
                id: issue.sectionId
            }
        })

        if(!section){
            return res.status(403).json({
                message:" section not found"
            })
        }

        const board= await prisma.boards.findFirst({
            where:{
                id: issue.boardId
            }
        })
     
        if(!board){
            return res.status(403).json({
                message:"board not found"
            })
        }

     
        const membership = await prisma.membership.findFirst({
            where: {
                userId: (req as any).userId,
                orgId: board.orgId
            }
        })
       if(!membership){
        return res.status(403).json({
            message: "not a member of this organization"
        })

    }
    })

    


