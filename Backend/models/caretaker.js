import mongoose ,{Schema}from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import redis from "../config/redis.js";

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

caretakerSchema.pre("save",async function()
{
    if (!this.isModified("password")) return 0
    this.password=await bcrypt.hash(this.password,parseInt(process.env.BCRYPT)||10)
})

caretakerSchema.methods.isPwdCorrect= async function(pwd)
{
    return await bcrypt.compare(pwd,this.password)
}

caretakerSchema.methods.generateAccessToken= function()
{
    return jwt.sign(
        {_id:this._id},
        process.env.ACCESS_PWD,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
caretakerSchema.methods.generateRefreshToken= async function()
{
    const token= jwt.sign(
        {
            _id:this._id,
            accessToken:this.accessToken
        },
        process.env.REFRESH_PWD,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
    this.refreshToken=token
    await this.save()
    return token
}

caretakerSchema.methods.myPlants = async function () {

    const caretakerKey = `caretaker:${this._id}`

    let plantIds = await redis.smembers(caretakerKey)

    if (plantIds.length === 0) {
        
        const customers = await mongoose.model("Customer").find({ caretaker: this._id}).select("-_id -__v").populate({path: "plant",select: "-__v -espMac -createdAt"})
        console.log(customers);
        
        if (customers.length)
            await redis.sadd(caretakerKey,...customers.map(c => c.plant._id.toString()))
        await redis.expire(caretakerKey,Number(process.env.REDIS_OWNER_EXPIRY))

        // cache each plant
        const pipeline = redis.pipeline()

        for (const c of customers){
            pipeline.set(`plant:${c.plant._id}`,JSON.stringify(c.plant))
            pipeline.expire(`plant:${c.plant._id}`,Number(process.env.REDIS_PLANT_EXPIRY))
}
        await pipeline.exec()

        return customers
}

    // cache hit
    const keys = plantIds.map(id => `plant:${id}`)
    const cachedPlants = await redis.mget(keys)
    const result = []
    const missing = []

    cachedPlants.forEach((plant, i) => {
        if (plant)
            result.push({plant:JSON.parse(plant)})
        else
            missing.push(plantIds[i])
})

    // search mongo only for missing plants
    if (missing.length) {

        const plants = await mongoose.model("Plant").find({_id: {$in: missing}}).select("-__v -espMac -createdAt")

        const pipeline = redis.pipeline()

        for (const plant of plants) {
            pipeline.set(`plant:${plant._id}`,JSON.stringify(plant))
            pipeline.expire(`plant:${plant._id}`,Number(process.env.REDIS_PLANT_EXPIRY))

            result.push({ plant})
}
        await pipeline.exec()}
    return result
}

export const caretaker = mongoose.model("Caretaker",caretakerSchema)