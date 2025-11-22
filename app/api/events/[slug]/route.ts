import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Event } from '@/database';

/**
 * Type for route parameters
 */
interface RouteParams {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 * 
 * @param request - Next.js request object
 * @param context - Route context containing dynamic parameters
 * @returns JSON response with event data or error message
 */
export async function GET(
    request: NextRequest,
    context: RouteParams
): Promise<NextResponse> {
    try {
        // Extract and await slug from params (Next.js 15+ returns Promise)
        const { slug } = await context.params;

        // Validate slug parameter
        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Slug parameter is required'
                },
                { status: 400 }
            );
        }

        // Validate slug format (alphanumeric, hyphens only)
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens'
                },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Query event by slug
        const event = await Event.findOne({ slug }).lean();

        // Handle event not found
        if (!event) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Event with slug '${slug}' not found`
                },
                { status: 404 }
            );
        }

        // Return event data
        return NextResponse.json(
            {
                success: true,
                message: 'Event fetched successfully',
                event
            },
            { status: 200 }
        );

    } catch (error) {
        // Log error for debugging (in production, use proper logging service)
        console.error('Error fetching event by slug:', error);

        // Handle Mongoose/MongoDB specific errors
        if (error instanceof Error) {
            // Handle database connection errors
            if (error.name === 'MongooseError' || error.name === 'MongoError') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Database connection error',
                        error: process.env.NODE_ENV === 'development' ? error.message : undefined
                    },
                    { status: 503 }
                );
            }

            // Handle validation errors
            if (error.name === 'ValidationError') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Validation error',
                        error: error.message
                    },
                    { status: 400 }
                );
            }
        }

        // Handle unexpected errors
        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred while fetching the event',
                error: process.env.NODE_ENV === 'development' && error instanceof Error
                    ? error.message
                    : undefined
            },
            { status: 500 }
        );
    }
}

