import {Router} from "express"
import sensorController  from "../controllers/sensorController.js"
import createPlant from "../controllers/plantController.js"


const router= Router()

router.route("/readings").post(sensorController)
router.route("/create").post(createPlant)


export default router;