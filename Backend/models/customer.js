import mongoose ,{Schema}from "mongoose"

const customerSchema= new Schema({

    caretaker:
    {
        type: mongoose.Schema.ObjectId,
        ref: "Caretakers",
        required:true
    },
    plant:
    {
        type: mongoose.Schema.ObjectId,
        ref: "Plant",
        required:true,
        index:true
    },
    accepted:
    {
        type: Boolean,
        default:false
    }

},{
    timestamps:true
})
customerSchema.index({plant:1,caretaker:1}, {unique:true})
customerSchema.index({caretaker:1,plant:1})

export const customer = mongoose.model("Customer",customerSchema)