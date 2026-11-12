import "dotenv/config"
import express from 'express'
import authRoutes from './src/routes/authRoutes.js'
import readingsRoutes from './src/routes/readingsRoutes.js'
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.use("/api/auth", authRoutes);
app.use("/api", readingsRoutes);


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})
