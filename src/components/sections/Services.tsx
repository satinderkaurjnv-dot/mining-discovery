"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  UserCheck,
  Building2,
  Mail,
  BookOpen,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

const servicesList = [
  {
    icon: FileText,
    title: "Press Release & News Distribution",
    description:
      "Publish drill results, exploration updates, and corporate announcements directly to targeted mining industry channels.",
    category: "News Distribution",
    cta: "Submit Release",
  },
  {
    icon: UserCheck,
    title: "Executive Leadership Interviews",
    description:
      "Feature management teams through in-depth Q&A interviews, executive video briefings, and technical project coverage.",
    category: "Executive Media",
    cta: "Request Interview",
  },
  {
    icon: Building2,
    title: "Company Profile & Asset Hubs",
    description:
      "Showcase mineral properties, resource estimates, mine development timelines, and leadership credentials on a dedicated hub.",
    category: "Corporate Hub",
    cta: "View Profiles",
  },
  {
    icon: Mail,
    title: "Executive Newsletter Coverage",
    description:
      "Position company updates directly in front of 40,000+ subscriber inboxes through featured header and native news placements.",
    category: "Direct Newsletter",
    cta: "View Placements",
  },
  {
    icon: BookOpen,
    title: "Global Digital Magazine Features",
    description:
      "Get featured in quarterly publication issues distributed to institutional mining investors and international industry events.",
    category: "Quarterly Publication",
    cta: "Browse Magazine",
  },
  {
    icon: LayoutGrid,
    title: "Targeted Industry Advertising",
    description:
      "Position display placements alongside daily commodity price updates, market intelligence, and sector news reports.",
    category: "Display Network",
    cta: "View Media Kit",
  },
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="py-16 md:py-24 bg-[#FAFAF9] border-b border-[#E5E5E3] font-sans">
      <div className="container-editorial">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <Badge variant="gold" size="md" className="mb-3 font-sans uppercase tracking-[0.05em] text-[11px]">
            Mining Media Services
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#0B1F3A] mb-4">
            Mining Communications & Media
          </h2>
          <p className="font-sans text-base text-[#57595E] leading-relaxed font-normal">
            Direct editorial coverage and news distribution for exploration breakthroughs, financial results, and mine development updates.
          </p>
        </div>

        {/* 6-Item Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group relative bg-white border border-[#E5E5E3] rounded-lg p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#0B1F3A]/30 font-sans"
              >
                <div>
                  {/* Top Bar with Icon & Technical Category Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-[#F0F4F8] text-[#0B1F3A] rounded-md transition-colors duration-300 group-hover:bg-[#0B1F3A] group-hover:text-[#B8860B]">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {/* Category Label in IBM Plex Mono */}
                    <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-[#B8860B] bg-[#FAF5E8] px-2.5 py-1 rounded-xs border border-[#B8860B]/20">
                      {service.category}
                    </span>
                  </div>

                  {/* Title in DM Serif Display */}
                  <h3 className="font-serif text-xl font-normal text-[#0B1F3A] mb-3 group-hover:text-[#162E50] transition-colors leading-snug">
                    {service.title}
                  </h3>

                  {/* Description in Inter 400 */}
                  <p className="font-sans text-sm text-[#57595E] leading-relaxed mb-6 font-normal">
                    {service.description}
                  </p>
                </div>

                {/* Specific Action CTA in Inter 600 */}
                <div className="pt-4 border-t border-[#E5E5E3]/60 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#0B1F3A] group-hover:text-[#B8860B] transition-colors">
                  <span>{service.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
