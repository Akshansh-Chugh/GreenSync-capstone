import mongoose, {Schema, model} from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
dotenv.config()

const ownerSchema= new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:false
    },
    adhaar:{
        type:String,
        required:false
    },
    plants:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"plant",
        required:false},

    totalFeilds:{
        type:Number,
        required:false
    },
    profile_pic:{
        type:String,
        required:false
    },
    refreshToken:{
        type:String,
        required:false
    }

},{timestamps:true})

ownerSchema.pre("save",async function()
{
    if (!this.isModified("password")) return next()
    this.password=await bcrypt.hash(this.password,parseInt(process.env.BCRYPT)||10)
})

ownerSchema.methods.isPwdCorrect= async function(pwd)
{
    return await bcrypt.compare(pwd,this.password)
}

ownerSchema.methods.generateAccessToken= function()
{
    return jwt.sign(
        {id:this._id},
        process.env.ACCESS_PWD,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
ownerSchema.methods.generateRefreshToken= function()
{
    return jwt.sign(
        {
            id:this._id,
            accessToken:this.accessToken
        },
        process.env.REFRESH_PWD,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}


export const owner = mongoose.model("Owner",ownerSchema)