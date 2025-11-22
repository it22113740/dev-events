import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn"
import { events } from "@/lib/constants";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const page = async () => {
  "use cache";
  cacheLife('hours');
  const events = await fetch(`${BASE_URL}/api/events`).then(res => res.json()).then(data => data.events);
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