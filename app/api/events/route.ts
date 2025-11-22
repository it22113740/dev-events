import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a new event
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const formData = await request.formData();
        let event;
        try {
            event = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({ message: "Invalid form data", error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
        }

        // Validate required fields
        const requiredFields = ['title', 'description', 'overview', 'venue', 'location', 'date', 'time', 'mode', 'audience', 'agenda', 'organizer', 'tags'];
        const missingFields: string[] = [];

        for (const field of requiredFields) {
            if (!event[field] || (typeof event[field] === 'string' && event[field].trim() === '')) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                    missingFields
                },
                { status: 400 }
            );
        }

        const file = formData.get("image") as File;
        if (!file) {
            return NextResponse.json({ message: "Image is required" }, { status: 400 });
        }
        let tags = JSON.parse(formData.get("tags") as string);
        let agenda = JSON.parse(formData.get("agenda") as string);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: "image",
                folder: "DevEvents"
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result && result.secure_url) {
                        resolve(result);
                    } else {
                        reject(new Error("Upload failed: no secure_url returned"));
                    }
                }
            }).end(buffer);
        });
        event.image = uploadResult.secure_url;
        const createdEvent = await Event.create({ ...event, tags: tags, agenda: agenda });
        return NextResponse.json({ message: "Event created successfully", event: createdEvent }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ message: "Failed to create event", error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
    }
}


// Get all events
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({ message: "Events fetched successfully", events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: "Failed to fetch events", error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
    }
}