import mongoose from "mongoose";

const connectDB = async ()=>{
    mongoose.connection.on(`connected`, ()=>console.log("  Connect Database ")) ;


    await mongoose.connect(`${ 
process.env.MONGODB_URI }/mern-auth`  //  `mongodb://localhost:27017/mern-auth` , 

);
};

export default connectDB;