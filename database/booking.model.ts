import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import Event, { IEvent } from './event.model';

/**
 * Interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking schema definition
 */
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries on eventId
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          // Email regex validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook: Verify that the referenced event exists
 * Throws error if eventId doesn't correspond to an existing Event
 */
bookingSchema.pre('save', async function (this: IBooking) {
  // Only validate if eventId is being set or modified
  if (this.isModified('eventId')) {
    const event = await Event.findById(this.eventId);
    if (!event) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
  }
});

// Create index on eventId for faster queries
bookingSchema.index({ eventId: 1 });

/**
 * Booking model
 */
const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;

