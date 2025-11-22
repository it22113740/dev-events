import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event schema definition
 */
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Title cannot be empty',
      },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Description cannot be empty',
      },
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Overview cannot be empty',
      },
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Image cannot be empty',
      },
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Venue cannot be empty',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Location cannot be empty',
      },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Audience cannot be empty',
      },
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: 'Agenda must be a non-empty array',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Organizer cannot be empty',
      },
    },
    tags: {
      type: [String],
      required: [true, 'Tags is required'],
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: 'Tags must be a non-empty array',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Generate URL-friendly slug from title
 * Converts to lowercase, replaces spaces and special chars with hyphens
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalize date to ISO format (YYYY-MM-DD)
 * Accepts various date formats and converts to ISO
 */
function normalizeDate(date: string): string {
  const dateObj = new Date(date);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
  }
  throw new Error(`Invalid date format: ${date}. Expected ISO format (YYYY-MM-DD)`);
}

/**
 * Normalize time to HH:MM format (24-hour)
 * Accepts various time formats and standardizes to HH:MM
 */
function normalizeTime(time: string): string {
  const trimmedTime = time.trim();
  
  // If already in HH:MM format, validate and return
  if (/^\d{2}:\d{2}$/.test(trimmedTime)) {
    const [hours, minutes] = trimmedTime.split(':').map(Number);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return trimmedTime;
    }
  }
  
  // Try parsing as Date and extract time
  try {
    const timeMatch = trimmedTime.match(/(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(AM|PM))?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];
      
      // Validate initial hours range (1-12 for AM/PM, 0-23 for 24-hour)
      if (ampm) {
        if (hours < 1 || hours > 12) {
          throw new Error('Invalid hours for AM/PM format');
        }
      } else {
        if (hours < 0 || hours > 23) {
          throw new Error('Invalid hours for 24-hour format');
        }
      }
      
      // Validate minutes range
      if (minutes < 0 || minutes > 59) {
        throw new Error('Invalid minutes range');
      }
      
      // Adjust hours for AM/PM conversion
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
      
      // Validate final hours range after AM/PM conversion
      if (hours < 0 || hours > 23) {
        throw new Error('Invalid hours after AM/PM conversion');
      }
      
      // Return formatted string with validated values
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  } catch {
    // Fall through to error
  }
  
  throw new Error(`Invalid time format: ${time}. Expected HH:MM format`);
}

/**
 * Pre-save hook: Generate slug from title and normalize date/time
 * Only regenerates slug if title has changed
 */
eventSchema.pre('save', function (this: IEvent) {
  // Generate slug only if title changed or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title);
  }
  
  // Normalize date to ISO format
  if (this.isModified('date')) {
    this.date = normalizeDate(this.date);
  }
  
  // Normalize time to HH:MM format
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }
});

// Create unique index on slug for faster lookups
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Event model
 */
const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;

