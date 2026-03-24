import mongoose, {Schema, model} from "mongoose"
import dotenv from "dotenv"
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
        required:true
    },
    adhaar:{
        type:String,
        required:true
    },
    plants:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"plant",
        required:true},

    totalFeilds:{
        type:Number,
        required:true
    },

},{timestamps:true})