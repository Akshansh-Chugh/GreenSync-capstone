import mongoose, {Schema, model} from "mongoose"

const readings= new Schema({

    temp:{
        type:[Number],
        required:true
    },
    humidity:{
        type:[Number],
        required:true
    },
    soilMoisture:{
        type:[Number],
        required:true
    },
    plant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"plant",
        required:true
    }

},{timestamps:true})

export const reading = mongoose.model("Reading",readings)