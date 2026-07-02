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
        ref: "Plants",
        required:true
    },
    accepted:
    {
        type: Boolean,
        default:false
    }

},{
    timestamps:true
})
customerSchema.index({caretaker:1, plant:1}, {unique:true})

export const customer = mongoose.model("Customer",customerSchema)