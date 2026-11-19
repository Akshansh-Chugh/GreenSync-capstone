import mongoose, {Schema, model} from "mongoose"

const readings= new Schema({

    temp:{
        type:Number,
        required:true
    },
    humidity:{
        type:Number,
        required:true
    },
    soilMoisture:{
        type:Number,
        required:true
    },
    n:{
        type:Number,
    },
    p:{
        type:Number,
    },
    k:{
        type:Number,
    },
    plant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"plant",
        required:true,
        index:true
    }

},{timestamps:true})

export const reading = mongoose.model("Reading",readings)