import "dotenv/config"
import express from 'express'
import authRoutes from './src/routes/authRoutes.js'

const app = express();

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.use("/api/auth", authRoutes);


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})
