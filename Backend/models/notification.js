import mongoose ,{Schema}from "mongoose"

const notificationSchema= new Schema({

    to:{
        type:mongoose.Schema.ObjectId,
        ref:"Plants",
        required:true,
        index:true
    },
    From:{
        type:mongoose.Schema.ObjectId,
        ref:"Caretakers",
        required:true
    },
    message:{
        type:String,
        required:true
    },
    seen:{
        type:String,
        default:false
    },

},{
    timestamps:true
})

export const notification = mongoose.model("Notification",notificationSchema)