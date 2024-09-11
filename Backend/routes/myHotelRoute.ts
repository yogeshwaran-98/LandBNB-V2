import { Router } from "express";
import verifyToken from "../middleware/auth";
import multer from "multer";
import {
  createHotel,
  validateHotel,
  getMyHotels,
  getMyHotel,
  updateHotel,
} from "../controllers/myHotelsController";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/",
  verifyToken,
  validateHotel,
  upload.array("imageFiles", 6),
  createHotel
);
router.get("/", verifyToken, getMyHotels);
router.get("/:id", verifyToken, getMyHotel);
router.put("/:hotelId", verifyToken, upload.array("imageFiles"), updateHotel);

export default router;
