import mongoose ,{Schema}from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const caretakerSchema= new Schema({

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
    },
    qualification:{
        type:String,
        required:true
    },
    adhaar:{
        type:String,
        required:true
    },
    refreshToken:{
        type: String
    },
    profilePic:{
        type: String,
        default:"https://res.cloudinary.com/chugh/image/upload/hzlskdlloutmzgg6ihfh.jpg"
    }


},{
    timestamps:true
})

caretakerSchema.pre("save",async function()
{
    if (!this.isModified("password")) return 0
    this.password=await bcrypt.hash(this.password,parseInt(process.env.BCRYPT)||10)
})

caretakerSchema.methods.isPwdCorrect= async function(pwd)
{
    return await bcrypt.compare(pwd,this.password)
}

caretakerSchema.methods.generateAccessToken= function()
{
    return jwt.sign(
        {_id:this._id},
        process.env.ACCESS_PWD,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
caretakerSchema.methods.generateRefreshToken= async function()
{
    const token= jwt.sign(
        {
            _id:this._id,
            accessToken:this.accessToken
        },
        process.env.REFRESH_PWD,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
    this.refreshToken=token
    await this.save()
    return token
}


export const caretaker = mongoose.model("Caretaker",caretakerSchema)