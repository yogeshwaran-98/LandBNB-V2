import { Router } from "express";
import verifyToken from "../middleware/auth";
import {
  validationCheck,
  userLogin,
  userLogout,
  validateToken,
} from "../controllers/authController";

const router = Router();

router.post("/login", validationCheck, userLogin);
router.get("/validate-token", verifyToken, validateToken);
router.post("/logout", userLogout);

export default router;
