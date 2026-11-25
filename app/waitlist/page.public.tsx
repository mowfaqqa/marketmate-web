import type { Metadata } from "next";
import Brand from "@/components/landing/brand";
import CampaignPreview from "@/components/landing/campaign-preview";
import WaitlistForm from "./waitlist-form";
import "../landing.css";

export const metadata: Metadata = {
  title: "Join the waitlist | MarketMate",
  description:
    "Register for early access to MarketMate’s marketing studio for small businesses.",
};

export default function WaitlistPage() {
  return (
    <div className="mm">
      <a className="mm-skip" href="#main">
        Skip to content
      </a>
      <header className="mm-header">
        <div className="mm-wrap mm-nav">
          <Brand />
        </div>
      </header>
      <main id="main" className="mm-hero" data-enter>
        <div className="mm-wrap mm-split">
          <div className="mm-intro">
            <h1>
              Get early access
              <br />
              <em>to MarketMate.</em>
            </h1>
            <p>
              Turn a product photo into a promotion for Instagram or WhatsApp.
              Join the waitlist to hear when you can try it for your business.
            </p>
            <WaitlistForm />
          </div>
          <CampaignPreview />
        </div>
      </main>
    </div>
  );
}
