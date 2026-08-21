"use client";

import React, { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

interface Company {
  name: string;
  logo: string;
}

/*
 * Hotlinked straight from miningdiscovery.com rather than copied into /public.
 *
 * The URLs carry literal spaces and are passed through unencoded on purpose. A browser
 * percent-encodes the path when it builds the request, so these resolve; pre-encoding
 * them here would be equivalent, but hand-editing them to %20 or to dashes is how the
 * filenames drift out of sync with the source. They are the source's names, verbatim.
 *
 * "BBluenergies" is not a typo on this side — that is the filename as served.
 */
const companies: Company[] = [
  { name: "Arras Minerals", logo: "https://www.miningdiscovery.com/trustedbrands/ARRAS Minerals LOGO.png" },
  { name: "Afrikor", logo: "https://www.miningdiscovery.com/trustedbrands/Afrikor LOGO.png" },
  { name: "Arizona Gold & Silver", logo: "https://www.miningdiscovery.com/trustedbrands/Arizona Gold & Silver LOGO.png" },
  { name: "Astra Exploration", logo: "https://www.miningdiscovery.com/trustedbrands/Astra Exploration LOGO.png" },
  { name: "Aurion Resources", logo: "https://www.miningdiscovery.com/trustedbrands/Aurion Resources LOGO.png" },
  { name: "Bluenergies", logo: "https://www.miningdiscovery.com/trustedbrands/BBluenergies LOGO.png" },
  { name: "Bactech", logo: "https://www.miningdiscovery.com/trustedbrands/Bactech LOGO.png" },
  { name: "Digipower X", logo: "https://www.miningdiscovery.com/trustedbrands/DIGIPOWER X LOGO.png" },
  { name: "Gold Hunter Resources", logo: "https://www.miningdiscovery.com/trustedbrands/Gold Hunter Resources LOGO.png" },
  { name: "Golkor", logo: "https://www.miningdiscovery.com/trustedbrands/Golkor LOGO.png" },
  { name: "Guanajuato", logo: "https://www.miningdiscovery.com/trustedbrands/Guanajuato LOGO.png" },
  { name: "Harfang", logo: "https://www.miningdiscovery.com/trustedbrands/Harfang LOGO.png" },
  { name: "He Capital", logo: "https://www.miningdiscovery.com/trustedbrands/He Capital LOGO.png" },
  { name: "Kodiak Copper", logo: "https://www.miningdiscovery.com/trustedbrands/Kodiak Copper LOGO.png" },
  { name: "Leviathan", logo: "https://www.miningdiscovery.com/trustedbrands/Leviathan LOGO.png" },
  { name: "Loyalist", logo: "https://www.miningdiscovery.com/trustedbrands/Loyalist LOGO.png" },
  { name: "Mining Investment Event", logo: "https://www.miningdiscovery.com/trustedbrands/Mining Investment Event LOGO.png" },
  { name: "Noble Plains", logo: "https://www.miningdiscovery.com/trustedbrands/Noble Plains LOGO.png" },
  { name: "Pan Global", logo: "https://www.miningdiscovery.com/trustedbrands/Pan Global LOGO.png" },
  { name: "Phenom Resources", logo: "https://www.miningdiscovery.com/trustedbrands/Phenom Resources LOGO.png" },
  { name: "Power Metallic", logo: "https://www.miningdiscovery.com/trustedbrands/Power Metallic LOGO.png" },
  { name: "SilverWolf", logo: "https://www.miningdiscovery.com/trustedbrands/SilverWolf LOGO.png" },
  { name: "Spacekor", logo: "https://www.miningdiscovery.com/trustedbrands/Spacekor LOGO.png" },
  { name: "US Gold", logo: "https://www.miningdiscovery.com/trustedbrands/US GOLD LOGO.png" },
  { name: "USDC", logo: "https://www.miningdiscovery.com/trustedbrands/USDC LOGO.png" },
  { name: "Vivio Power", logo: "https://www.miningdiscovery.com/trustedbrands/Vivio Power LOGO.png" },
  { name: "West Red Lake", logo: "https://www.miningdiscovery.com/trustedbrands/West Red Lake LOGO.png" },
];

/**
 * Stagger is declared on the container and inherited, rather than being a per-item delay.
 * The distinction matters here: 27 items at a hand-computed `index * 60ms` would need the
 * index threaded through every child, and would keep firing on a list that later changes
 * length. staggerChildren lets the parent own the cadence and the children stay identical.
 */
const GRID_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const CELL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/*
 * One grid cell's logo. Renders the remote image and falls back to a plain text wordmark
 * if the request fails, so a renamed or withdrawn file downgrades to a wordmark instead
 * of leaving a hole in the grid.
 *
 * Plain <img>, not next/image, and deliberately so. next/image would need the host added
 * to images.remotePatterns, and it would proxy all 27 files through the optimizer on a
 * host we do not control — one that could rate-limit or change a filename at any time.
 * A bare <img> also just fires onError on failure, which is the signal the fallback
 * needs; the optimizer surfaces a remote failure as a server-side error instead.
 */
const CompanyLogo: React.FC<{ company: Company }> = ({ company }) => {
  const [logoAvailable, setLogoAvailable] = useState(true);

  if (!logoAvailable) {
    return (
      <span className="text-center font-sans text-base font-semibold tracking-tight text-[#57595E] opacity-70 transition-opacity duration-300 ease-out group-hover:opacity-100">
        {company.name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={company.logo}
      alt={`${company.name} logo`}
      /*
       * Sized by WIDTH, not height, and that is the whole fix.
       *
       * Every one of these files is a 400x400 square, and the wordmark inside occupies a
       * median of 22% of that height (15% at worst) with white above and below it. A
       * max-height therefore caps the CANVAS, not the artwork: at max-h-11 the mark
       * rendered about 10px tall. Because the canvas is square, any height cap below the
       * cell's width binds first and shrinks the mark in both directions.
       *
       * w-full lets the square fill the cell instead, so the mark itself lands at ~171px
       * wide and ~43px tall. max-w caps it where a cell is wider than the artwork can
       * usefully fill (a two-column phone layout).
       */
      className="h-auto w-full max-w-[220px] object-contain opacity-70 grayscale transition-all duration-300 ease-out group-hover:opacity-100 group-hover:grayscale-0"
      /*
       * The files have no alpha channel — colour type 2, RGB, on a #FFFFFF ground. Left
       * alone, filling the cell would paint 27 white tiles onto the section's #F4F4F2.
       * multiply maps white onto the backdrop exactly (white x bg = bg) and leaves the
       * ink, which is why the cell below carries an explicit background: mix-blend-mode
       * blends within its own stacking context, and framer-motion's transform on the cell
       * creates one, so without a real colour there the white would blend against nothing
       * and survive.
       */
      style={{ mixBlendMode: "multiply" }}
      // Sent without a Referer so the request matches the one these URLs were verified
      // with. Costs nothing if the host does not hotlink-protect, and is the difference
      // between logos and 27 wordmarks if it ever starts to.
      referrerPolicy="no-referrer"
      onError={() => setLogoAvailable(false)}
    />
  );
};

export const TrustedBy: React.FC = () => {
  // A staggered reveal is exactly the motion this asks to be spared, and with once: true
  // there is no later chance to show the content — so reduced motion starts at the end
  // state rather than animating to it.
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-12 md:py-16 bg-[#F4F4F2] border-b border-[#E5E5E3] overflow-hidden font-sans">
      <div className="container-editorial mb-8 text-center">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#57595E]">
          Our Trusted Brands
        </p>
      </div>

      <div className="container-editorial">
        {/*
          The shared divider lines are gone, and they had to be: a continuous 1px grid and
          separated rounded cards are the same edge answered two different ways. Cells now
          each draw their own full border, and the gap is what keeps neighbouring borders
          from stacking into a 2px double line.

          A side effect worth knowing: with the cells no longer flush, the ragged last row
          stops reading as an unfinished grid and just reads as two cards. The old comment
          about it no longer applies.
        */}
        <motion.div
          className="grid gap-2"
          // auto-fit with a floor, so the browser picks the column count from the space
          // it actually has. At the container's 1136px interior this lands on 5 columns,
          // stepping down to 4, 3, then 2 as the viewport narrows. Raise the floor for
          // fewer, wider cells; 160px would give 7 and leave each logo noticeably tighter.
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
          variants={GRID_VARIANTS}
          initial={reduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {companies.map((company) => (
            <motion.div
              key={company.name}
              variants={CELL_VARIANTS}
              /*
               * Fixed height with overflow-hidden, rather than padding plus an auto
               * height. The square canvas is as tall as the cell is wide (~189px), and
               * letting that set the row height would make every row a square of mostly
               * white space. 180px clips the canvas top and bottom instead — invisibly,
               * since what is clipped is the white margin, and 180px still clears the
               * tallest artwork in the set (Mining Investment Event, ~170px).
               *
               * px-4 is 16px: with the artwork already carrying its own white margin, the
               * cell only needs enough to keep it off its border.
               *
               * Two details in the hover state are load-bearing rather than cosmetic:
               *
               *  - the transition names its properties instead of using transition-all.
               *    framer-motion drives the transform property on this element every frame during the
               *    reveal, and a CSS transition on that property would smear its own
               *    animation. the translate property is a SEPARATE property in Tailwind v4, so the
               *    hover lift composes with framer's transform instead of fighting it.
               *
               *  - the hover background is an opaque #F3F2EC, not rgba(212,175,55,0.03).
               *    It is that tint, pre-composited over #F4F4F2 by hand. The logo below
               *    relies on mix-blend-mode: multiply to erase its white ground, and
               *    multiply needs an opaque backdrop — swapping in a translucent colour
               *    would let the white box reappear on exactly the cell being looked at.
               */
              className="group relative flex h-[180px] items-center justify-center overflow-hidden rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-[#F4F4F2] px-4 transition-[translate,box-shadow,border-color,background-color] duration-[250ms] ease-out hover:z-10 hover:-translate-y-1 hover:border-[rgba(212,175,55,0.4)] hover:bg-[#F3F2EC] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            >
              <CompanyLogo company={company} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
