import express from 'express'
import { db } from '../prisma/db.ts';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();


const getStats = (readings) => {
    const values = readings.map((r) => r.value);
    const total = values.reduce((sum, v) => sum + v, 0);
    return {
        average: total / values.length,
        maximum: Math.max(...values),
        minimum: Math.min(...values),
    };
};

// Formats a Date as YYYY-MM-DD in UTC (same convention as readingService)
const toDateString = (d) => d.toISOString().slice(0, 10);

const getReadingsInRange = (userId, startDate, endDate) =>
    db.orm.public.Reading
        .where({userId})
        .where((r)=>r.readingDate.gte(startDate))
        .where((r)=>r.readingDate.lte(endDate))
        .all();

router.get("/daily",authMiddleware,async(req,res)=>{
    try{
        const userId = req.userId;
        const {date} = req.query;

        if(!date){
            return res.status(400).json({message:"date is required"});
        }

        const data = await db.orm.public.Reading.where({userId,readingDate:date}).all();

        if(!data.length){
            return res.status(404).json({message:"No reading found for that date"});
        }

        return res.status(200).json({message:"Data Fetched Successfully",readings:data,...getStats(data)});
    }catch(err){
        console.log("Error while fetching daily report",err);
        return res.status(500).json({message:"Something went wrong"})
    }
})

router.get("/this-month",authMiddleware,async(req,res)=>{
    try{
        const userId = req.userId;

        
        const now = new Date();
        const startTime = toDateString(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
        const endTime = toDateString(now);

        const data = await getReadingsInRange(userId, startTime, endTime);

        if(!data.length){
            return res.status(404).json({message:"No readings found for this month"});
        }

        return res.status(200).json({message:"Data Fetched Successfully",startTime,endTime,readings:data,...getStats(data)});

    }catch(err){
        console.log("Error while fetching current month report",err);
        return res.status(500).json({message:"Something Went Wrong"})
    }
})

router.get("/previous-month",authMiddleware,async(req,res)=>{
    try{
        const userId = req.userId;

        
        const now = new Date();
        const startTime = toDateString(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));
        const endTime = toDateString(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)));

        const data = await getReadingsInRange(userId, startTime, endTime);

        if(!data.length){
            return res.status(404).json({message:"No readings found for the previous month"});
        }

        return res.status(200).json({message:"Data Fetched Successfully",startTime,endTime,readings:data,...getStats(data)});

    }catch(err){
        console.log("Error while fetching previous month report",err);
        return res.status(500).json({message:"Something Went Wrong"})
    }
})


export default router;
