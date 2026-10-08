import {z} from "zod"

export const signupSchema= z.object({
    username:z.string().min(3),
    password:z.string().min(6),
    email:z.email(),
})

export const signinSchema= z.object({
    identifier:z.string().min(1,"Username or email is required"),
    password:z.string().min(1,"password is required")
    
})

export const verifyEmailSchema = z.object({
    email: z.email(),
    code: z.string().regex(/^\d{6}$/, "Enter a six-digit verification code"),
  });
