import express from "express"
import bcrypt from 'bcrypt'
import { db } from '../prisma/db.ts'
import jwt from 'jsonwebtoken'
const router = express.Router();


router.post("/signup",async(req,res)=>{
    try{
        const {name,email,password} = req.body ?? {};

        if(!name||!email||!password){
            return res.status(400).json({message:"All fields are required"})
        }

        const userFound =await db.orm.public.User.where({email}).first();

        if(userFound){
            return res.status(400).json({message:"User already exists. Please Log IN"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const createUser = await db.orm.public.User.create({
            email,
            name,
            passwordHash:hashedPassword
        })

        const { passwordHash, ...user } = createUser;
        return res.status(201).json({message:"User registered Successfully",user});
    }catch(err){
        console.log("Error while signing Up", err)
        return res.status(500).json({message:"Something went wrong"});
    }
})

router.post("/login",async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        const userFound = await db.orm.public.User.where({email}).first();

        if(!userFound){
            return res.status(404).json({message:"User doesn't exists. Please Sign Up"})
        }

        const passwordCompare = await bcrypt.compare(password,userFound.passwordHash);


        if(!passwordCompare){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        const token = await jwt.sign({userId:userFound.id},process.env.JWT_SECRET);

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000
        })

        return res.status(200).json({message:"User Logged In Successfully"})
    }catch(err){
        console.log("Error while Logging In",err);
        return res.status(500).json({message:"Something went wrong"})
    }
})

export default router;
