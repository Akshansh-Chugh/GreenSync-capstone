import {Router} from "express"
import {plantToDB, sendPlantReadings}  from "../controllers/sensorController.js"

const router= Router()

router.route("/addReading").put(plantToDB);
router.route("/readings").post(sendPlantReadings).get(sendPlantReadings);

export default router