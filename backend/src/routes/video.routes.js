import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getAllVideos, uploadVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const videoRoute = Router()

videoRoute.route('/getAllVideos').get(getAllVideos)

videoRoute.route('/upload-video',
    console.log("video route hit")
).post(
    upload.fields([
        {
            name:'originalUrl',
            maxCount:1
        },
        {
            name:'thumbnail',
            maxCount:'1'
        }
    ]),
   verifyJWT, uploadVideo
)

export default videoRoute