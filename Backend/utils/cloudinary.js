import {v2 as cloudinary} from "cloudinary";
import { apiError } from "./apiError.js";
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()
console.log(process.env.CLOUD_NAME)
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

const to_cloud=async(file)=>
{
    try
    {
        if (!file)
        {
            console.log("no file")
            return null
        }
        const response =await cloudinary.uploader.upload(file,
            {
                resource_type:"auto"
            }
        )
        if (!response.secure_url) 
            {
                fs.unlink(file)
                throw new apiError(500,"upload failed")
            } 
        return response.secure_url
    }
    catch(err)
    {
        console.log(err)
    }

    finally
    {
         if (file) fs.unlinkSync(file)
    }
}

const cloud_del= (async (url)=>
{
    try
    {
        if(!url) 
            { 
                console.log("No file")
                return null
            }
        const response=await cloudinary.uploader.destroy(url)
        if (response.result!=="ok") throw new apiError(500,"delete failed")
        return response
    }
    catch(err)
    {
        console.log(err)
    }
})

export {to_cloud,cloud_del}