"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function WaitlistForm() {
  const [pending, setPending] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const fields = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await api("/waitlist", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      setJoined(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError && [400, 429].includes(cause.status)
          ? cause.message
          : "We couldn’t save your registration. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mm-waitlist">
      <div role="status">
        {joined && (
          <p className="mm-confirm">
            <Check aria-hidden="true" size={20} /> You’re on the waitlist.
          </p>
        )}
      </div>
      {!joined && (
        <form onSubmit={submit}>
          <label htmlFor="waitlist-name">Your name</label>
          <input
            id="waitlist-name"
            name="name"
            autoComplete="name"
            required
            pattern={String.raw`.*\S.*`}
            maxLength={100}
            readOnly={pending}
          />
          <label htmlFor="waitlist-email">Email address</label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@yourbusiness.com"
            required
            maxLength={254}
            readOnly={pending}
          />
          <label htmlFor="waitlist-business">
            What type of business do you run?
          </label>
          <input
            id="waitlist-business"
            name="businessType"
            placeholder="e.g. I make and sell handmade bags"
            required
            pattern={String.raw`.*\S.*`}
            maxLength={250}
            readOnly={pending}
          />
          {error && <p role="alert">{error}</p>}
          <button className="mm-primary" type="submit" disabled={pending}>
            {pending ? "Joining…" : "Join the waitlist"}{" "}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}
