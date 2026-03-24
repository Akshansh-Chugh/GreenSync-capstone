import mongoose,{Schema, model} from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const coOwnerSchema= new Schema({

    owner1:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"owner",
        required:true
    },
    owner2:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"owner",
        required:false
    },
    plants:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"plant",
        required:true
    }

},{timestamps:true})