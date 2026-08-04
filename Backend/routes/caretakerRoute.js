import {Router} from "express"
import { upload } from "../middleware/multerMiddleware.js";
import { create, updateCaretaker,login,changeProfile,logout,changePwd, myPlants} from "../controllers/caretakerController.js"
import Check_required_fields from "../checks/ownerCheck.js"
import { Jwt } from "../middleware/care.auth.middleware.js";

const router= Router()

router.route("/create").put(upload.fields([{name:"profile_pic",maxCount:1}]),Check_required_fields,create)
router.route("/login").get(login)
router.route("/update").post(Jwt,Check_required_fields,updateCaretaker)
// router.route("/delete").delete(Jwt,deleteOwner)
router.route("/changePwd").post(changePwd)
router.route("/changeProfilePicture").post(Jwt,upload.fields([{name:"profile_pic",maxCount:1}]),changeProfile)
router.route("/logout").put(Jwt,logout)
router.route("/myPlants").get(Jwt,myPlants)

export default router;