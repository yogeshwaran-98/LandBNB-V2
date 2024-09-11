import mongoose from "mongoose";

const db_connection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("Connected to mongoose");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export default db_connection;
