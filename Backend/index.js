import connectDB from "./db/index.js"
import { asyncHandler} from "./utils/asyncHandler.js"
import app from "./app.js"
import dotenv from "dotenv"
dotenv.config()


asyncHandler(await connectDB()
.then(()=>
{
    console.log(`Db connected`)
    app.listen(process.env.PORT, (req,res)=>{})
})

.catch((err)=>
    {
        console.log("DB Connection Failed\n",err)
        process.exit(1)
    }
)
)

app.listen(process.env.PORT, (req,res)=>{})