import jwt from "jsonwebtoken"
import type  {Request, Response,NextFunction} from "express"
const JWT_SECRET= process.env.JWT_SECRET


export function authMiddleware(
    req:Request,
    res:Response,
    next:NextFunction )

{
    const token= req.headers.authorization

    if(!token){
        return res.status(403).json({
         message:"token missing"
        })
    }
      const decoded= jwt.verify(token,JWT_SECRET!) as {userId: number}
      if(!decoded){
        return res.status(403).json({
               message:"invalid token"
        })
      }

      (req as any).userId= decoded.userId
      next()
}