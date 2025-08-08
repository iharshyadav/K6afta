import mongoose from "mongoose";

const mongoURI = process.env.MONGO_URI!;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB connected successfully"))
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
