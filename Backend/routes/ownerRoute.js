import {Router} from "express"
import { upload } from "../middleware/multerMiddleware.js";
import { registerUser , loginUser } from "../controllers/ownerController.js"
import Check_required_fields from "../checks/ownerCheck.js"

const router= Router()

router.route("/create").put(upload.fields([{name:"profile_pic",maxCount:1}]),Check_required_fields,registerUser)
router.route("/login").post(loginUser)

export default router;