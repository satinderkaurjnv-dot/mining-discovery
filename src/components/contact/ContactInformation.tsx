"use client";

import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/17woBUaJqG/?mibextid=wwXIfr",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    href: "https://x.com/MiningDiscovery?s=20",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/miningdiscovery?igsh=cGp6ZzdtNWJlbHUw",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/miningdiscovery/",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@miningdiscovery",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Substack",
    href: "https://miningdiscovery.substack.com/?utm_source=global-search",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
      </svg>
    ),
  },
];

const SUBJECT_OPTIONS = [
  "Editorial Inquiry",
  "Advertising & PR",
  "Sponsorships",
  "General Question",
];

export const ContactInformation: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_OPTIONS[0]);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Contact Details Navy Card */}
            <div className="relative flex flex-col justify-between overflow-hidden bg-[#0B1F3A] p-8 sm:p-12 lg:col-span-5 text-white">
              {/* Background gold glow accent */}
              <div className="absolute -bottom-24 -right-24 size-64 rounded-full bg-[#B8860B]/15 blur-2xl pointer-events-none" />
              <div className="absolute -top-24 -left-24 size-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  Contact Information
                </h3>
                <p className="mt-2 text-sm sm:text-base font-medium text-gray-300">
                  Say something to start a live chat!
                </p>

                <div className="mt-10 sm:mt-12 space-y-6 sm:space-y-8">
                  {/* Email */}
                  <a
                    href="mailto:info@miningdiscovery.com"
                    className="flex items-start gap-4 text-gray-300 hover:text-white transition-colors group"
                  >
                    <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#B8860B] text-white transition-colors">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#B8860B]">
                        Email
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white break-all">
                        info@miningdiscovery.com
                      </span>
                    </div>
                  </a>

                  {/* Location */}
                  <div className="flex items-start gap-4 text-gray-300">
                    <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#B8860B]">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#B8860B]">
                        Headquarters
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white leading-relaxed">
                        180 Layfatte street
                        <br />
                        Passaic, New Jersey 07055
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                <span className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-4">
                  Follow Our Network
                </span>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-9 rounded-full bg-white/10 hover:bg-[#FF6B4A] hover:text-white text-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="p-8 sm:p-12 lg:col-span-7 bg-white">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="size-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#0B1F3A]">
                    Message Sent Successfully!
                  </h4>
                  <p className="mt-3 text-sm text-gray-600 max-w-md">
                    Thank you for reaching out. A member of the Mining Discovery team will review your inquiry and respond shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 rounded-xl bg-[#0B1F3A] hover:bg-[#B8860B] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-[#0B1F3A] placeholder:text-gray-400 focus:border-[#B8860B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-[#0B1F3A] placeholder:text-gray-400 focus:border-[#B8860B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Contact fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-[#0B1F3A] placeholder:text-gray-400 focus:border-[#B8860B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-[#0B1F3A] placeholder:text-gray-400 focus:border-[#B8860B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject options */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-3">
                      Select Subject
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {SUBJECT_OPTIONS.map((subj) => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setSelectedSubject(subj)}
                          className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-center ${
                            selectedSubject === subj
                              ? "bg-[#0B1F3A] text-white shadow-md scale-102"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-[#0B1F3A] placeholder:text-gray-400 focus:border-[#B8860B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0B1F3A] hover:bg-[#B8860B] text-white font-black text-xs uppercase tracking-widest px-8 py-4 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <Send className="size-4" />
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
