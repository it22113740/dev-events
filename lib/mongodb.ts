import mongoose, { Mongoose } from 'mongoose';

/**
 * Global interface to extend Node.js global type with mongoose connection cache
 * This prevents TypeScript errors when accessing the cached connection
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

/**
 * Cached connection object to store the mongoose connection and promise
 * Uses globalThis to persist across hot reloads in development
 */
const cached: { conn: Mongoose | null; promise: Promise<Mongoose> | null } = global.mongoose || {
  conn: null,
  promise: null,
};

// Assign cached object to global in development to persist across hot reloads
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose
 * Implements connection caching to prevent multiple connections during development
 * 
 * @returns {Promise<Mongoose>} Mongoose instance connected to MongoDB
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 * 
 * @example
 * ```typescript
 * import connectDB from '@/lib/mongodb';
 * await connectDB();
 * ```
 */
async function connectDB(): Promise<Mongoose> {
  // Get MongoDB URI from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;

  // Validate that MONGODB_URI is defined
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // If connection already exists and is ready, return cached connection
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create a new one
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable mongoose buffering
    };

    // Create connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance: Mongoose) => {
      // Log successful connection (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ MongoDB connected successfully');
      }
      return mongooseInstance;
    });
  }

  try {
    // Wait for connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;

