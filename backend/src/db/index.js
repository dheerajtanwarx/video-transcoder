import mongoose from "mongoose";

import dotenv from 'dotenv'
dotenv.config();

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)

        console.log(`\n ✅ MONGODB is connected !! DB host: ${connectionInstance.connection.host}`)

    } catch (error) {
         console.log("MONGODB connection error", error)
        console.log("URI =", process.env.MONGODB_URI);
        process.exit(1)
    }
}

export default connectDB