import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "About Us | Mining Discovery",
  description:
    "Mining Discovery brings clarity and depth to a mining sector often clouded by noise — covering exploration, production, regulation, investment, and ESG across global mining markets.",
};

/** What we offer. Deliberately the same four cadences the homepage panel names, so the
 *  two pages can't tell a visitor two different stories about what we publish. */
const OFFERINGS: Array<{ title: string; description: string }> = [
  {
    title: "Daily Mining News",
    description:
      "The day's filings, drill results, and corporate moves — filed while they still change decisions, not after.",
  },
  {
    title: "Weekly Newsletter",
    description:
      "One executive briefing a week, cut down to what actually moved and what it means for the quarter ahead.",
  },
  {
    title: "Monthly Magazine",
    description:
      "The long read, with room to breathe — profiles, jurisdiction deep-dives, and the stories a news cycle can't hold.",
  },
  {
    title: "Interactive Mining Platform",
    description:
      "Company profiles, project maps, and market intelligence you can navigate rather than scroll past.",
  },
];

/*
 * Leadership. Names and photographs are deliberately absent rather than invented — each
 * card carries the role, a monogram avatar, and the remit. Swap a real name in and drop a
 * headshot into /public when those details are ready; nothing else needs to change.
 */
const LEADERSHIP: Array<{ role: string; initials: string; bio: string }> = [
  {
    role: "Founder",
    initials: "FD",
    bio: "Leads on a conviction about how the global mining industry ought to communicate — through innovation rather than press-release boilerplate. Focused on the U.S. and Canadian markets, directing content strategy, digital marketing, and industry outreach.",
  },
  {
    role: "Co-Founder",
    initials: "CF",
    bio: "Brings deep digital marketing expertise across SEO, paid media, and content strategy — helping mining and resource companies build the kind of visibility that reaches the audiences who move markets.",
  },
  {
    role: "Advisor",
    initials: "AD",
    bio: "Brings decades of industry experience to bear on editorial direction and strategic partnerships, keeping our coverage anchored to how the sector actually works.",
  },
];

/*
 * The standalone About page, reached from the header's ABOUT link and the homepage CTA.
 *
 * Vertical scroll on purpose. The homepage's About section is a four-panel horizontal pin;
 * repeating that mechanic here would make the two read as the same component twice rather
 * than as a summary and its full account. Shared vocabulary instead of shared motion: gold
 * hairline, eyebrow, serif quote headline, and the same RevealOnScroll curve Stats uses.
 *
 * A server component — nothing here needs state, and RevealOnScroll carries its own
 * "use client" boundary. No <Header /> or <Footer />: the root layout (src/app/layout.tsx)
 * already wraps every page in both, so rendering them here would double them up. pt-32 is
 * the offset for that layout's fixed header, which overlays the page rather than sitting
 * in the flow.
 */
export default function AboutPage() {
  return (
    <div className="w-full bg-white font-sans text-[#1A1D21]">
      {/* --- HERO ----------------------------------------------------------------- */}
      <section className="relative border-b border-[#E5E4DE] bg-[#FBFBFA]">
        {/* Same 16px dot grain the Stats section carries, at the same 2% opacity. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-[0.02] [background-size:16px_16px]" />

        <div className="container-editorial relative pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="h-0.5 w-12 bg-[#B8860B]" />

          <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B]">
            About Us
          </span>

          <h1 className="mt-6 max-w-[16ch] font-geist text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#0B1F3A]">
            About Mining Discovery
          </h1>

          <p className="mt-8 max-w-3xl font-serif text-3xl font-normal leading-[1.15] tracking-[-0.015em] text-[#0B1F3A] sm:text-4xl lg:text-[44px]">
            &ldquo;One platform. Every major mining audience.&rdquo;
          </p>
        </div>
      </section>

      {/* --- OUR STORY ------------------------------------------------------------ */}
      <section className="border-b border-[#E5E4DE]">
        <div className="container-editorial py-20 md:py-28">
          <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <RevealOnScroll>
                <div className="h-0.5 w-12 bg-[#B8860B]" />
                <h2 className="mt-6 font-serif text-3xl font-normal leading-[1.15] tracking-[-0.015em] text-[#0B1F3A] sm:text-4xl">
                  Our Story
                </h2>
              </RevealOnScroll>
            </div>

            <div className="lg:col-span-8 lg:border-l lg:border-[#E5E4DE] lg:pl-12">
              <RevealOnScroll>
                <p className="text-xl font-normal leading-relaxed text-[#3A3D42] sm:text-2xl">
                  Mining Discovery began with a shared vision: to bring clarity and depth to a
                  mining sector often clouded by noise and half-truths. We recognised the
                  industry lacked a strong, trustworthy voice dedicated to the stories that
                  actually matter.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={0.08}>
                {/*
                  The six beats as a list rather than a comma run — they are the spine of what
                  we cover, and a reader scanning the page should be able to find them without
                  parsing a sentence.
                */}
                <ul className="mt-10 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                  {[
                    "Corporate actions",
                    "Sustainability",
                    "Exploration",
                    "Regulation",
                    "Investor relations",
                    "Innovation",
                  ].map((beat, index) => (
                    <li
                      key={beat}
                      className="flex items-baseline gap-4 border-b border-[#E5E4DE] py-3.5"
                    >
                      <span className="font-mono text-[11px] tabular-nums text-[#B8860B]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base font-medium text-[#1A1D21] sm:text-lg">
                        {beat}
                      </span>
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>

              <RevealOnScroll delay={0.16}>
                <p className="mt-10 text-lg font-normal leading-relaxed text-[#57595E] sm:text-xl">
                  Mining isn&apos;t just rocks and machines. It is people, communities,
                  economies, and a meaningful share of the planet&apos;s future — and we set out
                  to build a platform that honours all of that.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHAT WE OFFER -------------------------------------------------------- */}
      <section className="border-b border-[#E5E4DE] bg-[#FBFBFA]">
        <div className="container-editorial py-20 md:py-28">
          <RevealOnScroll>
            <div className="h-0.5 w-12 bg-[#B8860B]" />
            <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B]">
              What We Offer
            </span>
            <h2 className="mt-6 max-w-[20ch] font-serif text-3xl font-normal leading-[1.15] tracking-[-0.015em] text-[#0B1F3A] sm:text-4xl lg:text-[44px]">
              One newsroom, four cadences.
            </h2>
          </RevealOnScroll>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERINGS.map((offering, index) => (
              <RevealOnScroll key={offering.title} delay={index * 0.08}>
                <article className="group flex h-full flex-col rounded-xl border border-[#E5E4DE] bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#B8860B]/40 hover:shadow-lg">
                  <span className="font-mono text-[11px] tabular-nums text-[#B8860B]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-normal leading-snug tracking-[-0.01em] text-[#0B1F3A] transition-colors duration-300 group-hover:text-[#B8860B] sm:text-2xl">
                    {offering.title}
                  </h3>
                  <p className="mt-4 text-sm font-normal leading-relaxed text-[#57595E] sm:text-base">
                    {offering.description}
                  </p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- LEADERSHIP ----------------------------------------------------------- */}
      <section className="border-b border-[#E5E4DE]">
        <div className="container-editorial py-20 md:py-28">
          <RevealOnScroll>
            <div className="h-0.5 w-12 bg-[#B8860B]" />
            <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B]">
              Leadership
            </span>
            <h2 className="mt-6 max-w-[22ch] font-serif text-3xl font-normal leading-[1.15] tracking-[-0.015em] text-[#0B1F3A] sm:text-4xl lg:text-[44px]">
              The people behind the coverage.
            </h2>
          </RevealOnScroll>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {LEADERSHIP.map((person, index) => (
              <RevealOnScroll key={person.role} delay={index * 0.1}>
                <article className="flex h-full flex-col rounded-xl border border-[#E5E4DE] bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#B8860B]/40 hover:shadow-lg">
                  {/* Monogram stands in for a headshot: gold ring, navy initials. */}
                  <div
                    aria-hidden="true"
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#B8860B]/35 bg-[#FAF5E8] font-serif text-xl font-normal tracking-[0.02em] text-[#0B1F3A]"
                  >
                    {person.initials}
                  </div>

                  <h3 className="mt-6 font-serif text-2xl font-normal tracking-[-0.01em] text-[#0B1F3A]">
                    {person.role}
                  </h3>
                  <div className="mt-4 h-px w-10 bg-[#B8860B]/40" />

                  <p className="mt-5 text-sm font-normal leading-relaxed text-[#57595E] sm:text-base">
                    {person.bio}
                  </p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- POSITIONING STATEMENT ------------------------------------------------ */}
      <section className="bg-[#FBFBFA]">
        <div className="container-editorial py-24 text-center md:py-32">
          <RevealOnScroll>
            <div className="mx-auto h-0.5 w-12 bg-[#B8860B]" />

            <p className="mx-auto mt-10 max-w-4xl font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-normal leading-[1.18] tracking-[-0.02em] text-[#0B1F3A]">
              Mining Discovery is the first choice for mining news and insights — covering
              exploration, production, regulation, investment, and ESG across global mining
              markets.
            </p>

            <div className="mt-12">
              <Link
                href="/#submit-news"
                className="group inline-flex items-center gap-2 rounded-md bg-[#B8860B] px-6 py-3 font-sans text-sm font-semibold tracking-wide text-[#0B1F3A] shadow-[0_0_20px_rgba(184,134,11,0.35)] transition-all duration-300 hover:bg-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2"
              >
                Get Featured
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
