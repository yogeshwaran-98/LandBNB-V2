import express, { Request, Response } from "express";
import Hotel from "../models/hotelModel";
import { BookingType, HotelSearchResponse } from "../types/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";
import Razorpay from "Razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: "rzp_test_Rzn9KM5lSQG7DJ",
  key_secret: "h5aZ9gqsNFpuuBnXHlRh063N",
});

const router = express.Router();

export const searchQuery = async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
};

export const validateHotelId = [
  param("id").notEmpty().withMessage("Hotel ID is required"),
];

export const getHotel = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id.toString();

  try {
    const hotel = await Hotel.findById(id);
    res.json(hotel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching hotel" });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  console.log("Inside createPayment");
  const { numberOfNights } = req.body;
  const hotelId = req.params.hotelId;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return res.status(400).json({ message: "Hotel not found" });
  }

  const totalCost = hotel.pricePerNight * numberOfNights;

  const options = {
    amount: totalCost * 100,
    currency: "INR",
    receipt: `receipt_${new Date().getTime()}`,
    payment_capture: 1,
  };

  const order = await razorpay.orders.create(options);

  if (!order || !order.id) {
    return res.status(500).json({ message: "Error creating payment order" });
  }

  const response = {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    totalCost,
  };

  res.send(response);
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    console.log("Inside verify payment");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      console.log("Payment verified");
      return res
        .status(200)
        .json({ success: true, message: "Payment verified successfully" });
    } else {
      console.log("Invalid signatur");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    console.log("Inside createBooking");
    const { paymentOrderId } = req.body;

    const order = await razorpay.orders.fetch(paymentOrderId as string);

    if (!order) {
      return res.status(400).json({ message: "Payment order not found" });
    }

    // if (
    //   order.receipt !== req.params.hotelId ||
    //   order.userId !== req.userId
    // ) {
    //   return res.status(400).json({ message: "Payment order mismatch" });
    // }

    if (order.status !== "paid") {
      return res.status(400).json({
        message: `Payment order not succeeded. Status: ${order.status}`,
      });
    }

    const newBooking: BookingType = {
      ...req.body,
      userId: req.userId,
    };

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.hotelId },
      {
        $push: { bookings: newBooking },
      }
    );

    if (!hotel) {
      return res.status(400).json({ message: "hotel not found" });
    }

    await hotel.save();
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};
