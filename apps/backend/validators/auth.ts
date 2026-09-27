import {z} from "zod"

export const signupSchema= z.object({
    username:z.string().min(3),
    password:z.string().min(6),
    email:z.email(),
})

export const signinSchema= z.object({
    username:z.string().min(3),
    password:z.string(),
    email: z.email()
})
