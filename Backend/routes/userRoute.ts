import { Router } from "express";
import verifyToken from "../middleware/auth";
import {
  myProfile,
  validateProfile,
  userRegister,
} from "../controllers/userController";

const router = Router();

router.get("/me", verifyToken, myProfile);
router.post("/register", validateProfile, userRegister);

export default router;
