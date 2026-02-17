const mongoose = require("mongoose");

async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is required. Please set MONGO_URI in your .env file or environment variables.");
  }

  mongoose.set("strictQuery", true);
  
  const serverSelectionTimeoutMS = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 30000);
  const connectTimeoutMS = Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 30000);

  // Log connection attempt (without password for security)
  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@');
  console.log(`Connecting to MongoDB: ${safeUri}`);

  // Add connection event listeners
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS,
      connectTimeoutMS,
    });
    
    console.log(`MongoDB database: ${mongoose.connection.name}`);
    console.log(`MongoDB host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }

  return mongoose.connection;
}

module.exports = {
  connectDatabase,
};
