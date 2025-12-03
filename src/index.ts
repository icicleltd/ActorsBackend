import mongoose from "mongoose";
import app from "./app";
import config from "./config";

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
    await mongoose.connect(config.database_url as string);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

startServer();
