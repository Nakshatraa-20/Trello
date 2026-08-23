import express from "express"
import {prisma} from "db/client"
import bcrypt from "bcrypt"
import { password } from "bun"


const app = express()

app.post("signup",(req,res){
    const username= req.body.username
    const hashedpassword= await bcrypt.hash(req.body.password, 10)

    const existingUser= await prisma.user.findFirst({
        where:{
            username:username
        }
    })

    if(existingUser){
        return res.status(403).json({
            message:"user with this username already exists"
        })
    }

    const user= await prisma.user.create({
        data:{
               username:username,
               password:password
        }
    })

    res.json({
        message:"signup successfull"
    })


})

app.post("signup",(req,res){
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

        const matchedPassword= await bcrypt.compare(password,req.body.password)
        if(!matchedPassword){
            res.status(403).json({
                message:"incorrect password"
            })
        }

        const token = 
    })

