import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async(req, res)=>{
     const {page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId} = req.query;

     const pageNumber = Number(page)
     const limitNumber = Number(limit)
     const skip = (pageNumber - 1) * limitNumber

     const matchStage = {}

     if(query){
        matchStage.$or = [
            {title: { $regex:query, $options: "i" }},
            {description:{ $regex: query, $options: "i"}}
        ]
     }

     if(userId){
        matchStage.owner = new mongoose.Types.ObjectId(userId)
     }

     const sortStage = {
        [sortBy]: sortType =="asc" ? 1 : -1
     }

     const videos = await Video.aggregate([
        {
            $match: matchStage
        },
        {
            $sort: sortStage
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        },

        {
            $lookup:{
                from:"users",
                foreignField:"_id",
                localField:"owner",
                as:"ownerInfo"
            }
        },
        {
            $unwind:"$ownerInfo"
        },
        {
        $project:{
            _id:1,
            title:1,
            description:1,
            view:1,
            thumbnail:1,
            createdAt:1,
           " ownerInfo._id":1,
           "ownerInfo.username":1,
           "ownerInfo.avatar":1

        }
    }
    
     ])

     const totalVideos = await Video.countDocuments(matchStage)

     return res.status(200).json(
    new ApiResponse(
        200,
        {
            videos,
            page: pageNumber,
            limit: limitNumber,
            totalVideos
        },
        "Videos fetched successfully"
    )
)
})

const uploadVideo = asyncHandler(async(req, res)=>{
   try {
     const {description, title} = req.body
     console.log(req.body)
 
     console.log("requested files", req.files)
 
     let videoLocalPath
     let thumbnailLocalPath
 
     videoLocalPath = req.files?.originalUrl[0]?.path
     thumbnailLocalPath = req.files?.thumbnail[0]?.path
    
     let videoFile
     let thumbnail
     try {
         videoFile = await uploadOnCloudinary(videoLocalPath)
         
     } catch (error) {
          throw new ApiError(500, "error while uploading video on cloudinary")
     }
     try {
         thumbnail = await uploadOnCloudinary(thumbnailLocalPath) 
     } catch (error) {
          throw new ApiError(500, "error while uploading thumbnail on cloudinary")
     }

    //  console.log("ye hai video file url of cloudinary", videoFile)
    //  console.log("ye hai thumbnail file url of cloudinary", thumbnail)
 
      //duration hum cloudinary ke duration property se nikal skte h ye seconds me aata h'
     const videoDuration = videoFile?.duration
 
    //  const user = req.user._id
 
     const video = await Video.create({
         description,
         title,
         originalUrl: videoFile?.url,
         cloudinaryPublicId: videoFile?.public_id,
         thumbnail: thumbnail?.url,
         duration: videoDuration,
         owner: req.user?._id,
         size:  Math.round((videoFile?.bytes || 0) / (1024 * 1024))
     })
 console.log("uploaded Video", video)
     return res.status(200).json(
         new ApiResponse(200, {video}, "Video upload successfully")
     )
   } catch (error) {
    console.log('error while uploading:', error)
   }

})


export {uploadVideo, getAllVideos}