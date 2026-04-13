import mongoose, {Schema, model} from "mongoose"


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
        default:false,
        required:false
    },
    espMac:{
        type:String,
        required:true
    }

},{timestamps:true})

export const plant = mongoose.model("Plant",plantSchema)