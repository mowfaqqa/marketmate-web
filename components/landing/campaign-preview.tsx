"use client";

import { useState } from "react";
import { PanelsTopLeft, Sparkles } from "lucide-react";

const captions = {
  Instagram:
    "A little indigo for your everyday carry. Meet the Adire Tote, available for pickup in Abuja. DM to order.",
  WhatsApp:
    "Our Adire Tote is ₦10,000. Pickup is available in Abuja. Reply here to reserve yours.",
};

export default function CampaignPreview() {
  const [channel, setChannel] = useState<keyof typeof captions>("Instagram");
  return (
    <div className="mm-stage">
      <div className="mm-editor">
        <div className="mm-toolbar">
          <span>
            <PanelsTopLeft size={17} /> Promotion studio
          </span>
          <small>Preview</small>
        </div>
        <div
          className="mm-poster"
          aria-label="Example promotion for the Adire Tote"
        >
          <div className="mm-print" aria-hidden="true" />
          <div className="mm-poster-copy">
            <span>Abuja Threads</span>
            <strong>
              The Adire
              <br />
              <i>Tote.</i>
            </strong>
            <b>₦10,000</b>
          </div>
        </div>
        <div className="mm-caption">
          <div className="mm-caption-head">
            <strong>
              <Sparkles size={15} />
              Caption
            </strong>
            <div
              className="mm-channels"
              role="group"
              aria-label="Caption channel"
            >
              {(Object.keys(captions) as (keyof typeof captions)[]).map(
                (name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={channel === name}
                    onClick={() => setChannel(name)}
                  >
                    {name}
                  </button>
                ),
              )}
            </div>
          </div>
          <p aria-live="polite">{captions[channel]}</p>
        </div>
      </div>
    </div>
  );
}
