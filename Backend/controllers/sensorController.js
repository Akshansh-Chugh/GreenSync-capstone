import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {reading} from "../models/readings.js"
import {plant} from "../models/plant.js"

const plantToDB=asyncHandler(async(req,res)=>
{

    let {plant1, soilMoisture, humidity, temp, n, p, k}=req.body
    if (!plant1 || !soilMoisture || !humidity || !temp || !n || !p || !k) throw new apiError(400,"All fields are required")
    

    let verify = await plant.findById(plant1)
    if (!verify) throw new apiError(404,"Plant not found")
        
    if (soilMoisture >4095 || humidity>100 || temp>100 || n>100 || p>100 || k>100) throw new apiError(400,"Invalid values")
        
    let newReading= await reading.create({
        temp:temp,
        humidity:humidity,
        soilMoisture:soilMoisture,
        n:n,
        p:p,
        k:k,
        plant:plant1
    })
    if (!newReading) throw new apiError(500,"Reading creation failed")

    res.json(new apiResponse(200,newReading))

})

export default plantToDB;