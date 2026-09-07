"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export const ContactNewsletter: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState({
    corporateNews: true,
    magazine: false,
    dailyNewsletter: false,
    weeklyNewsletter: false,
  });
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  const handleToggle = (key: keyof typeof categories) => {
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="newsletter" className="bg-[#081121] relative w-full overflow-hidden py-12 sm:py-16 text-white">
      {/* Background radial gold glow effect */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 aspect-square w-[200%] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#B8860B1F_0%,transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Icon Badge & Divider */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="border-[#B8860B]/30 bg-[#B8860B]/10 flex size-12 items-center justify-center rounded-full border shadow-sm">
            <Mail className="text-[#B8860B] size-5" />
          </div>
          <div className="bg-[#B8860B] h-px w-16" />
        </div>

        {/* Eyebrow */}
        <p className="text-[#B8860B] mb-2 text-center text-xs font-bold tracking-[0.3em] uppercase">
          News &amp; Updates
        </p>

        {/* Main Heading */}
        <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-white uppercase md:text-4xl">
          Subscribe to Our Latest <span className="text-[#B8860B]">News &amp; Updates</span>
        </h2>

        {/* Form Container */}
        <div className="mx-auto max-w-3xl">
          {subscribed ? (
            <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/10 p-8">
              <CheckCircle2 className="size-10 text-[#B8860B] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">Thank you for subscribing!</h3>
              <p className="mt-2 text-sm text-gray-300">
                You will receive our latest mining intelligence and industry updates directly to your inbox.
              </p>
              <button
                onClick={() => setSubscribed(false)}
                className="mt-6 text-xs font-bold uppercase tracking-wider text-[#B8860B] hover:underline"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Your Name */}
              <div className="flex flex-col gap-1 sm:flex-1 w-full">
                <input
                  className="w-full bg-transparent transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 border-b pb-3 h-14 text-base sm:text-lg border-white/20 text-white placeholder:text-white/40 focus:border-[#B8860B]"
                  type="text"
                  autoComplete="name"
                  placeholder="Your Name"
                  required
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Your E-mail */}
              <div className="flex flex-col gap-1 sm:flex-1 w-full">
                <input
                  className="w-full bg-transparent transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 border-b pb-3 h-14 text-base sm:text-lg border-white/20 text-white placeholder:text-white/40 focus:border-[#B8860B]"
                  type="email"
                  autoComplete="email"
                  placeholder="Your E-mail"
                  required
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Subscribe Now Button */}
              <button
                className="inline-flex items-center justify-center font-bold uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 bg-[#B8860B] text-[#081121] hover:bg-[#A88848] hover:scale-105 active:scale-95 h-14 px-8 text-sm sm:text-base rounded-lg w-full shrink-0 sm:w-auto shadow-lg"
                type="submit"
              >
                Subscribe Now
              </button>
            </form>
          )}

          {/* Checkboxes Row */}
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <label className="flex cursor-pointer items-center gap-3 text-xs font-medium transition-colors text-white hover:text-[#B8860B]">
              <input
                type="checkbox"
                checked={categories.corporateNews}
                onChange={() => handleToggle("corporateNews")}
                className="accent-[#B8860B] size-4 shrink-0 rounded-sm border-white/20 bg-white/5 cursor-pointer"
              />
              <span>Corporate News</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-xs font-medium transition-colors text-white hover:text-[#B8860B]">
              <input
                type="checkbox"
                checked={categories.magazine}
                onChange={() => handleToggle("magazine")}
                className="accent-[#B8860B] size-4 shrink-0 rounded-sm border-white/20 bg-white/5 cursor-pointer"
              />
              <span>Magazine</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-xs font-medium transition-colors text-white hover:text-[#B8860B]">
              <input
                type="checkbox"
                checked={categories.dailyNewsletter}
                onChange={() => handleToggle("dailyNewsletter")}
                className="accent-[#B8860B] size-4 shrink-0 rounded-sm border-white/20 bg-white/5 cursor-pointer"
              />
              <span>Daily Newsletter</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-xs font-medium transition-colors text-white hover:text-[#B8860B]">
              <input
                type="checkbox"
                checked={categories.weeklyNewsletter}
                onChange={() => handleToggle("weeklyNewsletter")}
                className="accent-[#B8860B] size-4 shrink-0 rounded-sm border-white/20 bg-white/5 cursor-pointer"
              />
              <span>Weekly Newsletter</span>
            </label>
          </div>
        </div>

        {/* Bottom Link: Browse all newsletters */}
        <div className="mt-12 flex justify-center border-t border-white/5 pt-8">
          <Link
            className="hover:text-[#B8860B] inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-white/50 uppercase transition-colors"
            href="/newsletter"
          >
            <span>Browse all newsletters</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactNewsletter;
