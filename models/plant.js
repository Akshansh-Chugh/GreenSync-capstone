import mongoose, {Schema, model} from "mongoose"
import dotenv from "dotenv"
dotenv.config()


const plantSchema= new Schema({

    type:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:false
    },
    season:{
        type:String,
        enum:['summer','winter','spring','fall'],
        required:false
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
    }

},{timestamps:true})