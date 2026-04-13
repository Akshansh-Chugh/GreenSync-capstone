import mongoose, {Schema, model} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


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

    totalFeilds:{
        type:Number,
        required:false
    },
    profile_pic:{
        type:String,
        default:"https://res.cloudinary.com/chugh/image/upload/hzlskdlloutmzgg6ihfh.jpg",
        required:false
    },
    refreshToken:{
        type:String,
        required:false
    }

},{timestamps:true})

ownerSchema.pre("save",async function()
{
    if (!this.isModified("password")) return 0
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
ownerSchema.methods.generateRefreshToken= async function()
{
    const token= jwt.sign(
        {
            id:this._id,
            accessToken:this.accessToken
        },
        process.env.REFRESH_PWD,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
    this.refreshToken=token
    await this.save()
    return token
}


export const owner = mongoose.model("Owner",ownerSchema)