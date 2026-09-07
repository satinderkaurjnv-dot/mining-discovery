"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

/*
 * ABOUT and SERVICES are real routes now, not in-page anchors. The other three stay
 * anchors but are root-relative ("/#contact", not "#contact") — a bare hash on /about
 * would only set the fragment on a page that has no such section, and nothing would happen.
 *
 * Pointing SERVICES at /services does not touch the homepage's own services section: it
 * keeps its id and its place, and the footer still links to it.
 */
const navLinks = [
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Companies", href: "/#trusted-by" },
  { name: "Submit News", href: "/#submit-news" },
  { name: "Contact", href: "/#contact" },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 z-50 w-full font-sans bg-[#0B1F3A] backdrop-blur-md border-b border-white/10 shadow-lg py-2.5 transition-all duration-300">
      {/* Full-width container */}
      <div className="w-full px-4 sm:px-8 lg:px-16 flex items-center justify-between">
        {/* Original Brand Logo Left */}
        <Link
          href="/"
          className="group flex items-center focus:outline-none"
          aria-label="Mining Discovery Home"
        >
          <Image
            src="/logo.png"
            alt="Mining Discovery Logo"
            width={220}
            height={85}
            priority
            loading="eager"
            className="h-[44px] sm:h-[48px] md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
          />
        </Link>

        {/* Desktop Navigation Links (Inter 600) */}
        <nav className="hidden lg:flex items-center gap-8 font-sans">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wider text-white/90 hover:text-[#D4AF37] transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Header Action CTA: Distinct "Get Featured" Partnership CTA */}
        <div className="hidden lg:flex items-center">
          <Button
            variant="gold"
            size="sm"
            className="font-sans font-semibold tracking-wide text-[#0B1F3A] bg-[#B8860B] hover:bg-[#D4AF37] shadow-[0_0_20px_rgba(184,134,11,0.35)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-shadow text-xs py-1.5 px-4"
          >
            Get Featured
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-white hover:bg-white/10 active:bg-white/20 focus:outline-none transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 w-full max-w-[280px] sm:max-w-xs h-[100dvh] bg-[#0B1F3A] text-white shadow-2xl p-5 sm:p-6 flex flex-col justify-between transform transition-transform duration-300 ease-out border-l border-white/15 font-sans overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <Image
                    src="/logo.png"
                    alt="Mining Discovery"
                    width={180}
                    height={70}
                    loading="eager"
                    className="h-10 sm:h-11 w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 focus:outline-none"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/90 hover:text-[#D4AF37] py-3 px-2 rounded-md hover:bg-white/5 border-b border-white/10 transition-colors flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/40" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile CTA */}
            <div className="pt-5 border-t border-white/15 mt-4">
              <Button
                variant="gold"
                size="md"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans font-semibold tracking-wide text-[#0B1F3A] bg-[#B8860B] hover:bg-[#D4AF37] shadow-md py-3 text-xs"
              >
                Get Featured
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
