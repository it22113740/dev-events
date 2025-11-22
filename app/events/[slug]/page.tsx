import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { IEvent } from "@/database/event.model";
import { getSimilerEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import { events as fallbackEvents } from "@/lib/constants";

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

const EventDetailItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => {
  return (
    <div className="flex-row-gap-2 items-center">
      <Image src={icon} alt={alt} width={17} height={14} />
      <p>{label}</p>
    </div>
  )
}

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.length > 0 ? (
          agendaItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))
        ) : (
          <li>No agenda items</li>
        )}
      </ul>
    </div>
  )
}

const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag) => (
        <div key={tag} className="pill">{tag}</div>
      ))}
    </div>
  )
}

/**
 * Generate static params for common event pages
 * Returns at least one static param to satisfy Next.js build requirements
 */
export async function generateStaticParams() {
  // try {
  //   const BASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL);
  //   const response = await fetch(`${BASE_URL}/api/events`, {
  //     next: { revalidate: 3600 }
  //   });
    
  //   if (response.ok) {
  //     const data = await response.json();
  //     const events = data.events || [];
      
  //     if (events.length > 0) {
  //       return events.map((event: IEvent) => ({
  //         slug: event.slug,
  //       }));
  //     }
  //   }
  // } catch (error) {
  //   console.error('Error generating static params:', error);
  // }
  
  // Fallback: Return at least one static param using fallback events
  // This ensures the build doesn't fail when API is unavailable
  return fallbackEvents.map((event) => ({
    slug: event.slug,
  }));
}

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  // try {
  //   // Normalize and validate BASE_URL
  //   const BASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL);

  //   // Fetch event data with proper error handling
  //   const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
  //     next: { revalidate: 3600 } // Cache for 1 hour
  //   });

  //   // Check if response is successful
  //   if (!response.ok) {
  //     console.error(`Failed to fetch event: ${response.status} ${response.statusText}`);
  //     return notFound();
  //   }

  //   // Parse JSON response
  //   const data = await response.json();

  //   // Validate event data exists and is valid
  //   if (!data || !data.event || typeof data.event !== 'object') {
  //     console.error('Invalid or missing event data in API response');
  //     return notFound();
  //   }

  //   const event = data.event;

  //   // Validate required event fields before destructuring
  //   const requiredFields = ['description', 'image', 'title', 'overview', 'venue', 'location', 'date', 'time', 'mode', 'audience', 'agenda', 'organizer', 'tags'];
  //   const missingFields = requiredFields.filter(field => !event[field]);

  //   if (missingFields.length > 0) {
  //     console.error(`Event is missing required fields: ${missingFields.join(', ')}`);
  //     return notFound();
  //   }

  //   const { description, image, title, overview, venue, location, date, time, mode, audience, agenda, organizer, tags } = event;
  //   const bookings = 10;

  //   const similerEvents: IEvent[] = await getSimilerEventsBySlug(slug);
  //   console.log({ similerEvents });

  //   return (
  //     <section id="event">
  //       <div className="header">
  //         <h1>Event Description</h1>
  //         <p >{description}</p>
  //       </div>
  //       <div className="details">
  //         <div className="content">
  //           <Image src={image} alt={title} width={800} height={800} className="banner" />
  //           <section className="flex-col-gap-2">
  //             <h2>Overview</h2>
  //             <p>{overview}</p>
  //           </section>
  //           <section className="flex-col-gap-2">
  //             <h2>Event Details</h2>
  //             <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
  //             <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
  //             <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
  //             <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
  //             <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
  //           </section>
  //           <EventAgenda agendaItems={agenda} />
  //           <section className="flex-col-gap-2">
  //             <h2>About the Organizer</h2>
  //             <p>{organizer}</p>
  //           </section>
  //           <EventTags tags={tags} />
  //         </div>
  //         <aside className="booking">
  //           <div className="signup-card">
  //             <h2>Book Your Spot</h2>
  //             {bookings > 0 ? (
  //               <p className="text-sm">Join {bookings} people who have already booked their spot</p>
  //             ) : (
  //               <p className="text-sm">Be the first to book your spot</p>
  //             )}
  //             <BookEvent eventId={event._id.toString()} slug={slug} />
  //           </div>
  //         </aside>
  //       </div>
  //       <div className="flex w-full flex-col gap-4 pt-20">
  //         <h2>Similar Events</h2>
  //         <div className="events">
  //           {similerEvents.length > 0 ? (
  //             similerEvents.map((similerEvent: IEvent) => (
  //               <EventCard {...similerEvent} key={similerEvent._id.toString()} />
  //             ))
  //           ) : (
  //             <p>No similar events found</p>
  //           )}
  //         </div>
  //       </div>
  //     </section>
  //   );
  // } catch (error) {
  //   // Log the error for debugging
  //   console.error('Error fetching event details:', error);

  //   // Handle network failures or unexpected errors
  //   if (error instanceof TypeError && error.message.includes('fetch')) {
  //     console.error('Network error: Unable to fetch event data');
  //   } else if (error instanceof SyntaxError) {
  //     console.error('JSON parsing error: Malformed response data');
  //   }

  //   // Return not found page for any errors
  //   return notFound();
  // }
}

export default EventDetailsPage