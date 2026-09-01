import express from "express"
import jwt from "jsonwebtoken"
import prisma from "db/client"
import bcrypt from "bcrypt"
import { signupSchema } from "../validators/auth"

const router= express.Router()

router.post("/signup",async(req,res)=>{

    const result= signupSchema.safeParse(req.body)
    if (!result.success){
        res.status(403).json({
            message: "Invalid Input"
        })
    }
    const username= req.body.username
    const hashedpassword= await bcrypt.hash(req.body.password, 10)

    const userExists= await prisma.user.findFirst({
        where:{
            username: username
        }
    })

    if(!userExists){
        res.status(403).json({
            message:"user already exists"
        })
    }
         await prisma.user.create({
            data:{
                username:username,
                password:hashedpassword
            }
         })

         res.json({
            message: "user created successfully"
         })
})

router.post("/signin",async(req,res)=>{
    const user= await prisma.user.findUnique({
        where:{
            username: req.body.username
        }
        
            
        })
        if(!user){
            return res.status(403).json({
                  message:"no such user exists"
            })
        }

        const matchedPassword= await bcrypt.compare(user.password,req.body.password)
        if(!matchedPassword){
            res.status(403).json({
                message:"incorrect password"
            })
        }

        const token= jwt.sign({userId:user.id},process.env.JWT_SECRET!)

        res.json({
            message:token
        })

    })

    export default router 

    


    


