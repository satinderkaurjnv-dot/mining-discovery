"use client";

import React, { useState } from "react";
import { Mail, MapPin } from "lucide-react";

export const ContactInformation: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="pt-24 pb-8 sm:pt-28 sm:pb-10 lg:pt-32 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_60px_30px_rgba(0,0,0,0.04)] lg:grid lg:grid-cols-[360px_1fr]">
          {/* Left Column (360px): Navy card */}
          <div className="relative overflow-hidden bg-[#081121] px-10 py-12">
            <div className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 size-44 rounded-full bg-white/5" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-white">Contact Information</h2>
                <p className="mt-2 text-sm text-white/50">Say something to start a live chat!</p>
              </div>

              <div className="flex flex-col gap-7">
                {/* Email */}
                <div className="flex items-start gap-5">
                  <Mail className="mt-0.5 size-5 shrink-0 text-[#B8860B]" />
                  <a
                    href="mailto:info@miningdiscovery.com"
                    className="text-sm text-white transition-colors hover:text-[#B8860B]"
                  >
                    info@miningdiscovery.com
                  </a>
                </div>

                {/* Address */}
                <div className="flex items-start gap-5">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[#B8860B]" />
                  <p className="text-sm text-white">180 Layfatte street Passaic New Jersey 07055</p>
                </div>
              </div>

              {/* Social Icons */}
              <div className="mt-auto pt-16">
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/share/17woBUaJqG/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#B8860B] hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/MiningDiscovery?s=20"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#B8860B] hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/miningdiscovery?igsh=cGp6ZzdtNWJlbHUw"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#B8860B] hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/miningdiscovery/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#B8860B] hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@miningdiscovery"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#B8860B] hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a
                    href="https://miningdiscovery.substack.com/?utm_source=global-search"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Substack"
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#B8860B] hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="flex items-center px-10 py-12 lg:px-14">
            <div className="w-full">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="inline-flex size-14 items-center justify-center rounded-full bg-green-50 text-green-600 mb-4">
                    <svg
                      className="size-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#081121]">Message Sent Successfully!</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Thank you for reaching out. We will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 inline-flex items-center justify-center font-bold uppercase transition-colors bg-[#B8860B] text-[#081121] hover:bg-[#A88848] h-11 px-6 text-xs rounded-lg tracking-wider"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="fullName" className="text-xs font-semibold text-gray-500">
                        Full Name
                      </label>
                      <div className="flex flex-col gap-1">
                        <input
                          className="w-full bg-transparent transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 border-b border-gray-300 pb-3 text-[#081121] placeholder:text-gray-400 focus:border-[#B8860B] h-12 text-base"
                          type="text"
                          id="fullName"
                          placeholder="full name"
                          required
                          name="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-xs font-semibold text-gray-500">
                        Email
                      </label>
                      <div className="flex flex-col gap-1">
                        <input
                          className="w-full bg-transparent transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 border-b border-gray-300 pb-3 text-[#081121] placeholder:text-gray-400 focus:border-[#B8860B] h-12 text-base"
                          type="email"
                          id="email"
                          placeholder="email address"
                          required
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-gray-500">
                      Message
                    </label>
                    <div className="flex flex-col gap-1">
                      <textarea
                        className="w-full bg-transparent transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 resize-none border-b border-gray-300 pb-3 text-[#081121] placeholder:text-gray-400 focus:border-[#B8860B]"
                        id="message"
                        name="message"
                        placeholder="Write your message..."
                        rows={5}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      className="inline-flex items-center justify-center font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A88848] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 bg-[#B8860B] text-[#081121] hover:bg-[#A88848] h-12 px-6 text-sm rounded-lg min-w-40 tracking-wider shadow-md hover:shadow-lg transition-all"
                      type="submit"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInformation;
