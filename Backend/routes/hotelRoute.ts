import { Router } from "express";
import verifyToken from "../middleware/auth";
import {
  createPayment,
  getBookings,
  getHotel,
  getHotels,
  searchQuery,
  validateHotelId,
  verifyPayment,
} from "../controllers/hotelController";

const router = Router();

router.get("/search", searchQuery);
router.get("/", getHotels);
router.get("/:id", validateHotelId, getHotel);
router.post("/:hotelId/bookings/payment-order", verifyToken, createPayment);
router.post("/bookings/verify-payment", verifyToken, verifyPayment);
router.post("/:hotelId/bookings", verifyToken, getBookings);

export default router;
