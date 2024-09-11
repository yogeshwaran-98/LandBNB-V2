import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["auth_token"];
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  console.log("token present");

  try {
    const jwt_check = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    req.userId = (jwt_check as JwtPayload).userId;
    console.log("Token verified");
    next();
  } catch (err) {
    return res.status(401).json({ message: "unauthorized" });
  }
};

export default verifyToken;
