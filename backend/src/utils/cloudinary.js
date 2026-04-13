import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
      api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath){
         console.log("File not found for upload on cloudinary")
         return null;
        }

    console.log("Local file path:", localFilePath)

    const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
    })

    fs.unlinkSync(localFilePath)

    console.log("File is uploaded on cloudinary", response.secure_url)

    return response

    } catch (error) {
        console.log("Cloudinary upload error:", error.message)
fs.unlinkSync(localFilePath)
    return null
    }
}


export {uploadOnCloudinary}