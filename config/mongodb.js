import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on(`connected`, () => console.log("Database Connected"));

    // Change MONGODB_URI to MONGO_URI to match your .env file
    await mongoose.connect(`${process.env.MONGO_URI}/mern-auth`);
};

export default connectDB;