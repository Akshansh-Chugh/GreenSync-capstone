import mongoose, {Schema, model} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import redis from "../config/redis.js";


const ownerSchema= new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:false
    },
    adhaar:{
        type:String,
        sparse:true,
        unique:true
    },

    totalFeilds:{
        type:Number,
        required:false
    },
    profile_pic:{
        type:String,
        default:"https://res.cloudinary.com/chugh/image/upload/hzlskdlloutmzgg6ihfh.jpg",
        required:false
    },
    refreshToken:{
        type:String,
        required:false
    }

},{timestamps:true})

ownerSchema.pre("save",async function()
{
    if (!this.isModified("password")) return 0
    this.password=await bcrypt.hash(this.password,parseInt(process.env.BCRYPT)||10)
})

ownerSchema.methods.isPwdCorrect= async function(pwd)
{
    return await bcrypt.compare(pwd,this.password)
}

ownerSchema.methods.generateAccessToken= function()
{
    return jwt.sign(
        {_id:this._id},
        process.env.ACCESS_PWD,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
ownerSchema.methods.generateRefreshToken= async function()
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

ownerSchema.methods.myPlants = async function () {

    const ownerKey = `owner:${this._id}`

    // owner cached ?
    let plantIds = await redis.smembers(ownerKey)

    if (plantIds.length === 0) {

        const coOwners = await mongoose.model("CoOwner").find({ owner: this._id}).select("-_id -__v -owner").populate({path: "plant",select: "-__v -espMac -createdAt"})

        // owner -> plant ids
        if (coOwners.length)
            await redis.sadd(ownerKey,...coOwners.map(c => c.plant._id.toString()))
        await redis.expire(ownerKey,Number(process.env.REDIS_OWNER_EXPIRY))

        // cache each plant
        const pipeline = redis.pipeline()

        for (const c of coOwners){
            pipeline.set(`plant:${c.plant._id}`,JSON.stringify(c.plant))
            pipeline.expire(`plant:${c.plant._id}`,Number(process.env.REDIS_PLANT_EXPIRY))
        }
        await pipeline.exec()

        return coOwners
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

ownerSchema.pre("findOneAndDelete", async function()
{
    const oId =this.getFilter()._id
    Promise.all([
        await mongoose.model("Customer").deleteMany({owner:oId}),
        await mongoose.model("Owner").deleteMany({owner:oId}),
        await mongoose.model("CoOwner").deleteMany({owner:oId}),
        // await mongoose.model("Notification").deleteMany({owner:oId}),
    ])
})

export const owner = mongoose.model("Owner",ownerSchema)