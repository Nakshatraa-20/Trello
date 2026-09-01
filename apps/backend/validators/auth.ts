import {z} from "zod"

export const signupSchema= z.object({
    username:z.string().min(3),
    password:z.string().min(6)
})

export const signinSchema= z.object({
    email:z.email(),
    password:z.string()
})

