import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn"
import { events } from "@/lib/constants";


const page = () => {
  return (
    <section>
      <h1 className="text-center">Hub for Every Dev <br /> Ever You Can't Miss</h1>
      <p className="text-center mt-5">Hackothon, Meetups and Conferences All in One Place</p>

      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3>Featured Events
          <ul className="events">
            {
              events.map((event) => (
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