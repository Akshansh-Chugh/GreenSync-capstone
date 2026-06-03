import {Router} from "express"
import { upload } from "../middleware/multerMiddleware.js";
import { registerUser , loginUser, updateDetails, changePwd,changeProfilePic, logout} from "../controllers/ownerController.js"
import Check_required_fields from "../checks/ownerCheck.js"
import { Jwt } from "../middleware/auth.middleware.js";

const router= Router()

router.route("/create").put(upload.fields([{name:"profile_pic",maxCount:1}]),Check_required_fields,registerUser)
router.route("/login").post(loginUser)
router.route("/update").post(Jwt,Check_required_fields,updateDetails)
// router.route("/delete").delete(Jwt,deleteOwner)
router.route("/changePwd").post(changePwd)
router.route("/changeProfilePicture").post(Jwt,upload.fields([{name:"profile_pic",maxCount:1}]),changeProfilePic)
router.route("/logout").post(Jwt,logout)

export default router;