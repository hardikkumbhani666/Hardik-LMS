import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI is not defined in environment variables');
      console.error('Please create a .env file with MONGODB_URI set to your MongoDB connection string');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri, {
      // Remove deprecated options for newer Mongoose versions
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

