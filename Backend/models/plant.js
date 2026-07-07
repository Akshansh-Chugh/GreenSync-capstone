import mongoose, {Schema, model} from "mongoose"
import jwt from "jsonwebtoken"

const plantSchema= new Schema({
    type:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:false
    },
    season:{
        type:String,
        enum:['summer','winter','spring','fall'],
        required:false
    },
    water:
    {
        type:Number,
        required:false
    },

    location:{
        type:String,
        required:false
    },
    area:{
        type:Number,
        required:true
    },
    directCaretakerControl:{
        type:Boolean,
        default:false,
        required:false
    },
    espMac:{
        type:String,
        required:true
    },
    plant_pic:
    {
        type:String,
        default:"https://res.cloudinary.com/chugh/image/upload/v1780674139/grapes_np2tom.jpg"
    }

},{timestamps:true})

plantSchema.methods.generateRedreshToken= function()
{
    return jwt.sign({_id:this._id}, process.env.PLANT_REFRESH_KEY)
}

plantSchema.pre('findOneAndDelete', async function(){
    const pId =this.getFilter()._id;
    
    await Promise.all([
        mongoose.model("CoOwner").deleteMany({ plant: pId }),
        mongoose.model("Customer").deleteMany({ plant: pId }),
        // mongoose.model("Fertilizer").deleteMany({ plant: pId }),
        // mongoose.model("Notification").deleteMany({ to: pId }),
        mongoose.model("Reading").deleteMany({ plant: pId })
     ]); });

export const plant = mongoose.model("Plant",plantSchema)