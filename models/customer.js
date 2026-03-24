import mongoose , {Schema, model} from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const plantSchema= new Schema({

    type:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"owner",
        required:true
    },
    water:
    {
        type:Number,
        required:false
    },

    location:{
        type:String,
        required:false
    },
    area:{
        type:Number,
        required:true
    },
    directCaretakerControl:{
        type:Boolean,
        required:false
    },

},{timestamps:true})