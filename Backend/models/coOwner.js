import mongoose,{Schema} from "mongoose"

const coOwnerSchema= new Schema({

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Owner",
        required:true,
        index:true
    },
    plant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Plant",
        required:true,
        index:true
    }

},{timestamps:true})

export const coOwner = mongoose.model("CoOwner",coOwnerSchema)