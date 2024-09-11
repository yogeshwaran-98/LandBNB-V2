import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import userRoute from "./routes/userRoute";
import authRoutes from "./routes/authRoutes";
import hotelRoute from "./routes/hotelRoute";
import myBookingRoute from "./routes/myBookingsRoute";
import myHotelRoute from "./routes/myHotelRoute";
import connect_to_db from "./config/db";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
const PORT = process.env.PORT || 5000;

connect_to_db();

app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoute);
app.use("/api/my-bookings", myBookingRoute);
app.use("/api/my-hotels", myHotelRoute);
app.use("/api/users", userRoute);

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => console.log(`Server listening on PORT ${PORT}`));
