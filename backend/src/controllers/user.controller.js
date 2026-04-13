import { use } from "react"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"

import { uploadOnCloudinary } from "../utils/cloudinary.js"


const generateAccessTokenAndRefreshToken = async(userId)=>{

    try {

        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;

        console.log("refresh:", refreshToken)
        await user.save({validateBeforeSave:false})

        return {accessToken, refreshToken}
        
    } catch (error) {
        console.log("error in generating access or refresh token: ", error)
        throw new ApiError(500, 'something went wrong while generating access toekn and refresh token')

        
    }

}

const registerUser = asyncHandler(async(req, res)=>{


console.log("Files:", req.files)

const{fullname, email, username, password} = req.body

console.log("user details", req.body)

if(
    [fullname, email, username, password].some((field)=> field?.trim()==="")
){
    throw new ApiError(400, "All fields are required")
}

const existedUser = await User.findOne({
    $or:[{username}, {email}]
})

if(existedUser){
    throw new ApiError(409, "User with this email or usename are allready exist")
}

const avatarLocalPath = req.file?.path;

if(!avatarLocalPath){
    throw new ApiError(400, "avatar file is required")
}


console.log("Avatar local path", avatarLocalPath)
let avatar;

try {
    avatar = await uploadOnCloudinary(avatarLocalPath)
} catch (error) {
   throw new ApiError(500, "error: uploading images to cloudinary")
}

if(!avatar){
  throw new ApiError(400, "Avatar upload failed")
}

const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        password,
        username: username.toLowerCase()

})

console.log("created user: ", user)

const createdUser = await User.findById(user._id).select('-password -refreshToken')

 if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


})


const loginUser = asyncHandler(async(req, res)=>{
    const{username, email, password} = req.body

   if (!(email || username)) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or : [{username}, {email}]
    }, console.log("email:", email))

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isUserValid = await user.isPasswordCorrect(password)
     if (!isUserValid) {
        throw new ApiError(409, "Invalid user credentials")
    }

    const{accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : false
    }

    console.log("✅Loggedin user:", loggedInUser)
    console.log("AccessTOken,", accessToken)
    console.log("RefreshTOken,", refreshToken)
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken //at or rt ko json me bhejna ek good practice ni hai ye risky ho skta hai js ko inka access mil skta hai or hack ho skta h program
                },
                "User logged in Successfuly"
            )
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

export {registerUser, loginUser, generateAccessTokenAndRefreshToken, getCurrentUser}