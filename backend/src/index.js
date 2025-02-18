import express from "express";
import authRoutes from "./routes/auth.route.js"
import cors from "cors";
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import path from "path";
import {connectDB} from "./lib/db.js"
import cookieParser from "cookie-parser"
import {app,server} from "./lib/socket.io.js"

dotenv.config()
const __dirname = path.resolve();

const PORT=process.env.PORT


app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}   
)) 
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

  
app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
server.listen(PORT,()=>{
    console.log("running",process.env.PORT);
    connectDB()
});