import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn"
import { events as fallbackEvents } from "@/lib/constants";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";

/**
 * Normalize URL to ensure it has a protocol
 */
function normalizeUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('BASE_URL is not defined');
  }
  
  // If URL already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// for production URLs
  return `https://${url}`;
}

const page = async () => {
  "use cache";
  cacheLife('hours');
  
  let events: IEvent[] = [];
  
  try {
    const BASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL);
    const response = await fetch(`${BASE_URL}/api/events`, {
      next: { revalidate: 3600 }
    });
    
    if (response.ok) {
      const data = await response.json();
      events = data.events || [];
    } else {
      console.error(`Failed to fetch events: ${response.status}`);
      events = fallbackEvents as IEvent[];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    events = fallbackEvents as IEvent[];
  }
  
  return (
    <section>
      <h1 className="text-center">Hub for Every Dev <br /> Ever You Can't Miss</h1>
      <p className="text-center mt-5">Hackothon, Meetups and Conferences All in One Place</p>

      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3>Featured Events
          <ul className="events">
            {/* Why This checking important? Because if the events is not found, it will return an empty array, and if the events is found, it will return the events */}
            {events && events.length > 0 &&
              events.map((event: IEvent) => (
                <li key={event.title}>

                  <EventCard {...event} />
                </li>
              ))}
          </ul>
        </h3>
      </div>
    </section>
  );
};

export default page;