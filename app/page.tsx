import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  FileText,
  Leaf,
  WandSparkles,
} from "lucide-react";
import CampaignPreview from "@/components/landing/campaign-preview";
import "./landing.css";

export const metadata: Metadata = {
  title: "MarketMate | Marketing for small businesses",
  description:
    "Turn your products into branded promotions, write captions for Instagram and WhatsApp, and plan your week with MarketMate.",
  other: { "page-type": "software", "site-kind": "software" },
};
const steps = [
  {
    icon: WandSparkles,
    title: "Create a promotion",
    body: "Choose a product and a goal. Give the caption your own voice and pair it with a branded graphic.",
  },
  {
    icon: CalendarDays,
    title: "Plan your posts",
    body: "Lay out a week of Instagram and WhatsApp promotions. Review each draft before you share it.",
  },
  {
    icon: FileText,
    title: "Follow up a sale",
    body: "Send a quotation when a customer asks for a price. Issue an invoice and record the payment when it arrives.",
  },
];

function Brand() {
  return (
    <Link href="/" className="mm-brand">
      <span>
        <Leaf size={22} aria-hidden="true" />
      </span>
      MarketMate
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="mm">
      <a className="mm-skip" href="#main">
        Skip to content
      </a>
      <header className="mm-header">
        <div className="mm-wrap mm-nav">
          <Brand />
          <nav aria-label="Main navigation">
            <a className="mm-guide" href="#workflow">
              How it works
            </a>
            <Link href="/login">Sign in</Link>
            <Link className="mm-nav-action" href="/register">
              Create account
            </Link>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="mm-hero" data-enter>
          <div className="mm-wrap mm-split">
            <div className="mm-intro">
              <h1>
                Your products,
                <br />
                <em>ready to post.</em>
              </h1>
              <p>
                Turn what you sell into branded graphics and ready-to-edit
                captions. Plan a week of marketing for your small business in
                one place.
              </p>
              <div className="mm-actions">
                <Link className="mm-primary" href="/register">
                  Create your account <ArrowRight size={18} />
                </Link>
                <a className="mm-secondary" href="#workflow">
                  See how it works <ArrowDown size={16} />
                </a>
              </div>
            </div>
            <CampaignPreview />
          </div>
        </section>
        <section id="workflow" className="mm-workflow">
          <div className="mm-wrap mm-work-grid">
            <h2>
              From the first post
              <br />
              to the <em>paid invoice.</em>
            </h2>
            <div>
              {steps.map(({ icon: Icon, title, body }) => (
                <article key={title}>
                  <Icon aria-hidden="true" size={23} />
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="mm-wrap mm-footer">
          <Brand />
          <Link href="/register">
            Create your account <ArrowRight size={17} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
