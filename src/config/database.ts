import mongoose from 'mongoose';

const connectToDatabase = async () => {
  const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/mydatabase';
    try {
        await mongoose.connect(dbUri);
        console.log('Connected to the database successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

export default connectToDatabase;