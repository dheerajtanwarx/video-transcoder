import mongoose, { model } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { returnFirstArg } from "html-react-parser/lib/utilities";
const userSchema = new mongoose.Schema({
username:{
    type:String,
    required:true,
    unique:true,
    lowecase:true,
    trim:true,
    index:true
},
email:{
    type:String,
    required:true,
    unique:true,
    lowecase:true,
    trim:true,
},
fullname:{
    type:String,
    required:true,
    trim:true,
    index:true
},
avatar:{
    type:String ,//cloudinary url
    required:true
},
password:{
    type:String,
    required:[true, "Password is required"]
},

refreshToken:{
type:String
}

},{timestamps:true})


userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next
    }

    this.password = await bcrypt.hash(this.password, 10)

    next;
})


userSchema.methods.isPasswordCorrect = async function(password){
return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken=async function(){
 return jwt.sign(
    {
        id: this._id,
        username: this.username,
        email:this.email,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
 )
}

userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign(
        {
        id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env. REFRESH_TOKEN_EXPIRY
        }
)
}

export const User = model("User", userSchema)