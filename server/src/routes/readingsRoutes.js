import express from 'express'
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { db } from '../prisma/db.ts';
import { validateReading } from '../Services/readingService.js';

const router = express.Router()


router.post("/readings",authMiddleware,async(req,res)=>{
    try{
        const userId = req.userId;
        const {date,slot,value} = req.body ?? {};
        if(!date|| !slot || value === undefined || value === null || value === ""){
            return res.status(400).json({message:"All values are required"});
        }

        const {error,data} = await validateReading({userId,value,slot,date});
        if(error){
            return res.status(400).json({message:error});
        }

        const reading = await db.orm.public.Reading.create({userId,...data})

        return res.status(201).json({message:"Reading Created Successfully",reading});

    }catch(err){
        console.log("Error while posting a Reading",err);
        return res.status(500).json({message:"Something Went Wrong"})
    }
})

router.get("/readings",authMiddleware,async(req,res)=>{
    try{
        const userId = req.userId;

        const readingsFound = await db.orm.public.Reading.where({userId}).all();

        if(!readingsFound){
            return res.status(404).json({message:"Enter your reading first"})
        }

        return res.status(200).json({message:"Readings Fetched Successfully",reading:readingsFound});
    }catch(err){
        console.log("Error while fetching readings")
        return res.status(500).json({message:"Something went wrong"});
    }
})

router.put("/readings/edit/:id",authMiddleware,async(req,res)=>{
    try{
        const userId = req.userId;
        const id = Number(req.params.id);

        // Only find readings that belong to this user
        const postFound = await db.orm.public.Reading.where({id,userId}).first();

        if(!postFound){
            return res.status(404).json({message:"Reading Not Found"});
        }

        const {value,date,slot}= req.body ?? {};

        if(!date || !slot || value === undefined || value === null || value === ""){
            return res.status(400).json({message:"All fields are required"});
        }

        const {error,data} = await validateReading({userId,value,slot,date,excludeId:id});
        if(error){
            return res.status(400).json({message:error});
        }

        const updatedReading = await db.orm.public.Reading.where({id,userId}).update(data)

        return res.status(200).json({message:"Reading Updated Successfully",reading:updatedReading});

    }catch(err){
        console.log("Error while editing a reading",err);
        return res.status(500).json({message:"Something Went Wrong"})
    }
})



router.delete("/readings/delete/:id",authMiddleware,async(req,res)=>{
    try{
        const userId = req.userId;
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid reading id" });
        }

        const deletedPost = await db.orm.public.Reading.where({id,userId}).delete();

        if(!deletedPost){
            return res.status(404).json({ message: "Reading Not Found" });
        }

        return res.status(200).json({message:"Post Deleted Successfully"});
    }catch(err){
        console.log("Error while deleting the post",err);
        return res.status(500).json({message:"Something Went Wrong"})
    }
})

export default router;
