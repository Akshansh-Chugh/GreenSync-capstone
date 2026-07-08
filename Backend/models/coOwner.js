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
coOwnerSchema.index({ owner: 1, plant: 1 }, { unique: true });
coOwnerSchema.index({ plant: 1, owner: 1 });
export const coOwner = mongoose.model("CoOwner",coOwnerSchema)