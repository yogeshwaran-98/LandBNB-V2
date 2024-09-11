import { Router } from "express";
import verifyToken from "../middleware/auth";
import { myBookings } from "../controllers/myBookingController";

const router = Router();

router.get("/", verifyToken, myBookings);

export default router;
