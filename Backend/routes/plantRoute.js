import {Router} from "express"
import sensorController  from "../controllers/sensorController.js"
import createPlant from "../controllers/plantController.js"
import { Jwt } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multerMiddleware.js"


const router= Router()

router.route("/readings").post(sensorController)
router.route("/create").post(upload.fields([{name:"plant_pic",maxCount:1}]),Jwt,createPlant)


export default router;