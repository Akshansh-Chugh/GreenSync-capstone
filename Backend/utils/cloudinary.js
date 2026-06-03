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

const cloud_del = async (url) => {
    if (!url) return null;

    try {
        const publicId = url
            .split("/upload/")[1]
            ?.replace(/^v\d+\//, "")
            ?.replace(/\.[^/.]+$/, "");

        if (!publicId) {
            throw new apiError(400, "Invalid Cloudinary URL");
        }

        const response = await cloudinary.uploader.destroy(publicId);

        if (
            response.result !== "ok" &&
            response.result !== "not found"
        ) {
            throw new apiError(500, "Delete failed");
        }

        return response;

    } catch (err) {
        console.error("Cloudinary delete error:", err);
        throw err;
    }
};

export {to_cloud,cloud_del}