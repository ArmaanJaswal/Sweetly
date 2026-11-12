import jwt from 'jsonwebtoken'
import { db } from '../prisma/db.ts';

export const authMiddleware =async(req,res,next)=>{
    try{
        const token = req.cookies?.token;

        if(!token){
            return res.status(401).json({message:"Please LogIn First"})
        }

        let decoded;
        try{
            decoded = jwt.verify(token,process.env.JWT_SECRET);
        }catch(err){
            return res.status(401).json({message:"Session expired or invalid. Please LogIn again"})
        }

        const userId = decoded.userId;

        const userFound = await db.orm.public.User.where({id:userId}).first();

        if(!userFound){
            return res.status(401).json({message:"Please LogIn first"});
        }

        req.userId = userId;
        next()

    }catch(err){
        console.log("Error in Auth Middleware",err);
        return res.status(500).json({message:"Something Went Wrong"})
    }
}
