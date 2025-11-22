"use client";
import { useState, type FormEvent } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { success } = await createBooking({ eventId, slug, email });
        if (success) {
            setSubmitted(true);
            posthog.capture('event_booked', { eventId, slug, email });
        } else {
            console.error('Failed to book event');
            posthog.captureException('Failed to book event');
        }
    }
    return (
        <div id="book-event">
            {submitted ? (<p>Thank you for Signing up!</p>) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                        <button className="button-submit" type="submit">Submit</button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default BookEvent