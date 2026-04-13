import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.route.js'
import videoRoute from './routes/video.routes.js'
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))




app.use(express.json({limit:"20mb"}))


app.use(express.urlencoded({extended:true, limit:"16kb"}))

app.use(express.static('public'))

app.use(cookieParser())


app.use((req, res, next) => {
  console.log("🌍 REQUEST:", req.method, req.url);
  next();
});

//user route
app.use('/api/v1/user', userRouter)

//video route
app.use('/api/v1/video',videoRoute )




app.get('/', (req, res)=>{
    res.status(200).json({message:"hello dheeraj"})
})

export {app}