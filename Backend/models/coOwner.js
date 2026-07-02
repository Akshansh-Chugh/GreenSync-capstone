import mongoose,{Schema} from "mongoose"

const coOwnerSchema= new Schema({

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Owner",
        required:true
    },
    plant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Plant",
        required:true
    }

},{timestamps:true})
coOwnerSchema.index({ owner: 1, plant: 1 }, { unique: true })

export const coOwner = mongoose.model("CoOwner",coOwnerSchema)