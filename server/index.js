import "dotenv/config"
import express from 'express'
import authRoutes from './src/routes/authRoutes.js'
import readingsRoutes from './src/routes/readingsRoutes.js'
import reportRoutes from './src/routes/reportRoutes.js'
import cookieParser from "cookie-parser";
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.use("/api/auth", authRoutes);
app.use("/api", readingsRoutes);
app.use("/api/report",reportRoutes)


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})
