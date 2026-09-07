"use client";

import React from "react";

export const AboutAdvisor: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-[#0B1F3A] text-2xl sm:text-3xl font-bold tracking-tight">
            Advisors
          </h2>
          <div className="mt-3 flex items-center">
            <div className="size-2.5 shrink-0 rounded-full bg-[#B8860B]" />
            <div className="h-px w-40 bg-gradient-to-r from-[#0B1F3A] to-transparent" />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-10">
          <div className="group hover:shadow-[#B8860B]/10 relative flex w-full flex-col items-start gap-8 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:flex-row sm:items-center sm:p-10">
            <div className="bg-[#B8860B]/5 group-hover:bg-[#B8860B]/10 absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-bl-full transition-colors" />
            <div className="bg-[#0B1F3A] flex size-20 shrink-0 self-start sm:size-28 items-center justify-center rounded-2xl text-3xl sm:text-4xl font-black text-white shadow-lg">
              LS
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#0B1F3A] mb-2 text-2xl sm:text-3xl font-black tracking-tighter uppercase">
                Laura Stein
              </h3>
              <p className="text-[#B8860B] mb-6 text-[11px] font-black tracking-[0.4em] uppercase">
                Advisor, Mining Discovery
              </p>
              <p className="text-sm leading-relaxed font-medium text-gray-600">
                Mining Discovery Advisor, Laura Stein is one of the predecessors with 50-plus years of exceptional
                global mining industry experience. There exists a lighter shade in her operational experience and
                knowledge matrix across mineral and market boundaries in exploration, project development, and strategic
                advisory operations. Laura has been reputed for the singular ability to guide projects through
                discovery and development while staying true to her principles out of respect for the challenge put in
                front of her. Designing a full range of support and services, she enables Mining Discovery in the
                identification, evaluation, and advancement of promising mineral opportunities with confidence and
                transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutAdvisor;
