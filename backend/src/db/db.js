import mongoose from "mongoose";
import dns from "dns"

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
]);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn("⚠️ MONGO_URI is not defined in backend/.env. Please configure your MongoDB URI.");
            return;
        }
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected!");
    } catch (error) {
        console.error("MongoDB connection warning: ", error.message);
    }
};

export default connectDB;