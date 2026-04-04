import {Router} from "express"
import { upload } from "../middleware/multerMiddleware.js";
import { registerUser , loginUser } from "../controllers/ownerController.js"

const router= Router()

router.route("/create").put(upload.fields([{name:"profile_pic",maxCount:1}]),registerUser)
router.route("/login").post(loginUser)

export default router;