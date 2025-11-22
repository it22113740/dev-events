'use server';

import connectDB from "../mongodb";
import Event from "@/database/event.model";
import { unstable_cache } from "next/cache";

export const getSimilerEventsBySlug = unstable_cache(
    async (slug: string) => {
        try {
            await connectDB();
            const event = await Event.findOne({ slug });
            if (!event) {
                return [];
            }
            const similarEvents = await Event.find({ 
                _id: { $ne: event._id }, 
                tags: { $in: event.tags } 
            }).lean();
            return similarEvents;
        } catch (error) {
            console.error('Error fetching similar events:', error);
            return [];
        }
    },
    ['similar-events'],
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ['events']
    }
);