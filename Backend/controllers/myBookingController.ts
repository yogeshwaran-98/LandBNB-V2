import express, { Request, Response } from "express";

import Hotel from "../models/hotelModel";
import { HotelType } from "../types/types";

export const myBookings = async (req: Request, res: Response) => {
  try {
    //bookings array contains at least one entry with the specified userId along with other users too
    //hotels contain all hotel list with every booking made , not just this user id
    //from all the bookings , the bookings made by this user will be filtered in next step
    const hotels = await Hotel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    //filters the bookings based on the userid
    const results = hotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId
      );

      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(),
        bookings: userBookings,
      };

      return hotelWithUserBookings;
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
};
