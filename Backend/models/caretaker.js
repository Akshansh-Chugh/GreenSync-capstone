import mongoose ,{Schema}from "mongoose"

const caretakerSchema= new Schema({

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
    qualification:{
        type:String,
        required:true
    },
    adhaar:{
        type:String,
        required:true
    },
    refreshToken:{
        type: String
    },
    profilePic:{
        type: String,
        default:"https://res.cloudinary.com/chugh/image/upload/hzlskdlloutmzgg6ihfh.jpg"
    }


},{
    timestamps:true
})

export const caretaker = mongoose.model("Caretaker",caretakerSchema)