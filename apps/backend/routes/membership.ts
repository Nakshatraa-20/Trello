import prisma from "db/client"
import express from "express"

const router= express.Router()


router.post("/join-org",async(req,res)=>
 {
    const membership= await prisma.membership.create({
        data:{
            userId:(req as any).userId,
            orgId: req.body.orgId,
            role:"member"
        }
    })
      return res.status(201).json({
        message:"joined organisation successfully"
      })

      return res.json(membership)
})

export default router