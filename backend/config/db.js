// server/config/db.js
import mongoose from 'mongoose';
import { runSeed } from '../seed.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atomquest');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Automatically seed the database if it is empty (useful for Vercel demo)
    await runSeed();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // In serverless environments, we shouldn't exit the process. 
    // Just log the error and let the next request try again.
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
