import express from "express"
import prisma from "db/client"
import {authMiddleware} from "../middleware/auth"

const app= express()
app.use(authMiddleware)
app.post("/create-org",async(req,res)=>{
    

 const organisation = await prisma.org.create({
        data:{
            
            name: req.body.name,
            description: req.body.description
        }
    })

    await prisma.membership.create({
        data:{
            userId: (req as any).userId,
            orgId: organisation.id,
            role: "admin"
        }
    })
    res.status(201).json({
        message:"org created successfully"
    })
})

app.get("/getorg",async(req,res)=>{
    
    
    await prisma.membership.findMany({
        where:{
            userId:(req as any).userId,
            
        }
    })
})

app.delete("/delete-org",async(req,res)=>
{
   const member= prisma.membership.findFirst({
    where:{
        userId:(req as any).userId,
        orgId: req.body.orgId,
        role: "admin"
    }
   })
   if(!member){
    return res.status(403).json({
        message:"user cannot delete the org"
    })
   }

      
    
   
   await prisma.org.delete({
    where:{
        
        id: req.body.orgId
    }
   })

})






