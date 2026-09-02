import {z} from "zod"

export const createIssueSchema= z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),

    boardId: z.number().int().positive(),

    sectionId: z.number().int().positive(),
})