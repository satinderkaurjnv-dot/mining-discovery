"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export const ContactNewsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="border-t border-gray-200 bg-[#FAFAF9] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1F3A] relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
          {/* Decorative corner glow */}
          <div className="absolute top-0 right-0 size-72 rounded-full bg-[#B8860B]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-3">
              News &amp; Updates
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-white">
              Subscribe to Our Latest News &amp; Updates
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-300">
              Mining Discovery is your trusted source for in-depth mining news, executive profiles, company insights,
              and industry analysis — connecting the global mining community with the stories that matter.
            </p>

            {subscribed ? (
              <div className="mt-8 flex items-center gap-3 text-green-400 font-semibold text-sm">
                <CheckCircle2 className="size-5" />
                <span>Thank you for subscribing to Mining Discovery briefings!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-gray-400 focus:border-[#B8860B] focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B8860B] hover:bg-[#9E7208] text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>
            )}

            <div className="mt-6">
              <Link
                href="/newsletter"
                className="text-xs font-semibold text-[#B8860B] hover:underline underline-offset-4 inline-flex items-center gap-1"
              >
                Browse all newsletters &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactNewsletter;
