import mongoose, {Schema, model} from "mongoose"

const fertilizerSchema= new Schema({
    
    name:{
        type:String,
        required:true
    },
    concentration:{
        type:Number,
        required:true
    },
    plant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"plant",
        required:true
    },   

},{timestamps:true})

export const fertilizer = mongoose.model("Fertilizer",fertilizerSchema)