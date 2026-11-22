import Link from 'next/link';
import { ArrowRight, CalendarDays, FileText, Leaf, Sparkles } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'Write a promotion', detail: 'Start with a product and a goal. Edit the suggested caption until it sounds like you.' },
  { icon: CalendarDays, title: 'Plan your week', detail: 'Organise seven days of Instagram and WhatsApp posts. Review each one before sharing.' },
  { icon: FileText, title: 'Follow up a sale', detail: 'Turn a customer enquiry into a quotation, issue an invoice and track manual payments.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f1] text-[#153b2c]">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight"><Leaf aria-hidden="true" />MarketMate</Link>
        <nav aria-label="Account" className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/login" className="py-3 hover:underline">Sign in</Link>
          <Link href="/register" className="rounded-full border border-current px-4 py-2">Create account</Link>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <h1 className="max-w-2xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl">Turn your products into your next post.</h1>
            <p className="my-6 max-w-lg text-lg leading-relaxed text-[#466053]">MarketMate helps small businesses write captions, design branded graphics and plan a week of promotions from the products they already sell.</p>
            <Link href="/register" className="inline-flex items-center gap-4 rounded-full bg-[#174d34] px-6 py-3 font-semibold text-white hover:bg-[#103e29]">Create your account <ArrowRight size={18} /></Link>
          </div>
          <figure className="rounded-2xl bg-[#e6ead7] p-6 sm:p-10">
            <div className="mx-auto max-w-sm -rotate-2 rounded-sm bg-[#173f32] p-7 text-[#fff8da] shadow-lg sm:p-9">
              <div className="flex items-center justify-between border-b border-[#91a58b] pb-4 text-xs font-bold uppercase tracking-widest">Abuja Threads <Leaf size={18} /></div>
              <p className="mt-8 font-serif text-5xl leading-none sm:text-6xl">The Adire<br /><i className="text-[#dcea96]">Tote.</i></p>
              <p className="my-5 max-w-52 text-sm">A little indigo for your everyday carry.</p>
              <div className="flex justify-between gap-3 border-t border-[#91a58b] pt-4 text-sm"><strong>₦10,000</strong><span>Abuja pickup</span></div>
            </div>
            <figcaption className="mt-6 text-center text-sm text-[#466053]">Example product promotion</figcaption>
          </figure>
        </section>
        <section aria-label="What you can do with MarketMate" className="border-t border-[#cdd6c8] bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-10 md:grid-cols-3">
            {features.map(({ icon: Icon, title, detail }) => (
              <article key={title}><Icon aria-hidden="true" className="mb-4 text-primary" /><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 max-w-sm text-[#466053]">{detail}</p></article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
