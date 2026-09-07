"use client";

import React from "react";

export const AboutManagement: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAFAF9]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-[#081121] text-2xl sm:text-3xl font-bold tracking-tight">
            Management <span className="text-[#B8860B]">Team</span>
          </h2>
          <div className="mt-3 flex items-center">
            <div className="size-2.5 shrink-0 rounded-full bg-[#B8860B]" />
            <div className="h-px w-40 bg-gradient-to-r from-[#081121] to-transparent" />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-10">
          {/* Gaurav Sharma */}
          <div className="group hover:shadow-[#B8860B]/10 relative flex w-full flex-col items-start gap-8 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:flex-row sm:items-center sm:p-10">
            <div className="bg-[#B8860B]/5 group-hover:bg-[#B8860B]/10 absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-bl-full transition-colors" />
            <div className="relative z-10 flex w-full items-start gap-4 sm:w-auto">
              <div className="bg-[#081121] flex size-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg sm:size-32 sm:text-4xl">
                GS
              </div>
              <div className="min-w-0 flex-1 sm:hidden">
                <h3 className="text-[#081121] text-2xl font-black tracking-tighter uppercase">
                  Gaurav Sharma
                </h3>
                <p className="text-[#B8860B] mt-2 text-[10px] font-black tracking-[0.3em] uppercase">
                  Founder, Mining Discovery
                </p>
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#081121] mb-2 hidden text-3xl font-black tracking-tighter uppercase sm:block">
                Gaurav Sharma
              </h3>
              <p className="text-[#B8860B] mb-6 hidden text-[11px] font-black tracking-[0.4em] uppercase sm:block">
                Founder, Mining Discovery
              </p>
              <p className="text-sm leading-relaxed font-medium text-gray-600">
                Gaurav Sharma, who established Mining Discovery, is at the forefront with an idea that the global
                mining industry should communicate via innovation. He concentrates on the U.S. and Canada practices
                and thus directs the content strategy, digital marketing, and outreach of the platform. Mining
                Discovery has matured into a vibrant media and marketing centre under his guidance, where mining
                firms, investors, and professionals exchange knowledge and grow their footprint. His speciality covers
                the areas of advertising, PR, eCommerce, and web development, which result in the creation of scalable
                solutions applicable to both the technology and the storytelling sides. His progressive approach is
                very much a part of Mining Discovery, which has already earned the reputation of a trustworthy partner
                in the industry&apos;s growth.
              </p>
            </div>
          </div>

          {/* Sagar Bakshi */}
          <div className="group hover:shadow-[#B8860B]/10 relative flex w-full flex-col items-start gap-8 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:flex-row sm:items-center sm:p-10 sm:flex-row-reverse">
            <div className="bg-[#B8860B]/5 group-hover:bg-[#B8860B]/10 absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-bl-full transition-colors" />
            <div className="relative z-10 flex w-full items-start gap-4 sm:w-auto">
              <div className="bg-[#081121] flex size-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg sm:size-32 sm:text-4xl">
                SB
              </div>
              <div className="min-w-0 flex-1 sm:hidden">
                <h3 className="text-[#081121] text-2xl font-black tracking-tighter uppercase">
                  Sagar Bakshi
                </h3>
                <p className="text-[#B8860B] mt-2 text-[10px] font-black tracking-[0.3em] uppercase">
                  Director &amp; Co-Founder, Mining Discovery
                </p>
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#081121] mb-2 hidden text-3xl font-black tracking-tighter uppercase sm:block">
                Sagar Bakshi
              </h3>
              <p className="text-[#B8860B] mb-6 hidden text-[11px] font-black tracking-[0.4em] uppercase sm:block">
                Director &amp; Co-Founder, Mining Discovery
              </p>
              <p className="text-sm leading-relaxed font-medium text-gray-600">
                The platform of Mining Discovery, masterminded by Sagar Bakshi, connects the global mining community
                and also empowers it. He is mainly focusing on U.S. and Canadian mining activities and is the one that
                helps the companies put out their messages regarding industry news, corporate updates, and event
                promotions. Mining Discovery, under his leadership, has grown into a total growth partner and is
                providing services like advertising, public relations, brand marketing, and web development. Apart
                from this, Sagar is also working with eCommerce startups on Shopify and Amazon by giving them
                dropshipping and digital marketing support. His strategic planning, coupled with his innovative
                methods, will continue to play a significant role in the measurable growth of the mining and digital
                marketing industries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutManagement;
