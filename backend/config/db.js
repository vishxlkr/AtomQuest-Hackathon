import mongoose from "mongoose";

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/atomquest";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export default connectDB;