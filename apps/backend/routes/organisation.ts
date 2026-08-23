import express from "express"
import prisma from "db/client"

const app= express()
app.post("/create-org",authmiddleware,async(req,res)=>{
    

 const organisation = await prisma.Org.create({
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

app.get("/getorg",authmiddleware,async(req,res)=>{
    
    
    await prisma.membership.findMany({
        where:{
            userId:(req as any).userId,
            
        }
    })
})

app.delete("/delete-org",authmiddleware,async(req,res)=>
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

   await prisma.membership.delete({
    where:{
        
        orgId: req.body.orgId,
        
    }
   })
   await prisma.Org.delete({
    where:{
        id: req.body.orgId
    }
   })
})







