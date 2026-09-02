import {z} from "zod"

export const createBoardSchema= z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    orgId:z.number().int().positive()
})

export const updateBoardSchema = z.object({
    name: z.string().min(1).max(100).optional(),
  
    description: z.string().max(500).optional(),
  })


  

