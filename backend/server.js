import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))


const PORT = 4000;

app.use(express.json({limit:"20mb"}))


app.use(express.urlencoded({extended:true, limit:"16kb"}))

app.use(express.static('public'))

app.use(cookieParser())


app.listen(PORT, (req, res)=>{
    console.log(`app is listen on ${PORT}`)
    console.log("hello dheeraj")
})

app.get('/', (req, res)=>{
    res.status(200).json({message:"hello dheeraj"})
})

export {app}