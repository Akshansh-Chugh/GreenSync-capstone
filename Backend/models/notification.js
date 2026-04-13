import mongoose ,{Schema}from "mongoose"

const notificationSchema= new Schema({

    to:{
        type:String,
        required:true
    },
    From:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    seen:{
        type:String,
        required:true
    },

},{
    timestamps:true
})

export const notification = mongoose.model("Notification",notificationSchema)