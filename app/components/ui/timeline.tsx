"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

gsap.registerPlugin(ScrollTrigger);

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Create timeline for the progress line
    const progressTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });

    progressTl.to(progressLineRef.current, {
      height: "100%",
      ease: "none",
    });

    // Animate each timeline item
    timelineRefs.current.forEach((item, index) => {
      if (!item) return;

      gsap.set(item, { opacity: 0, y: 50 });

      ScrollTrigger.create({
        trigger: item,
        start: "top center+=100",
        onEnter: () => {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
          setActiveIndex(index);
        },
      });
    });
  }, []);

  return (
    <div
      className="w-full bg-gradient-to-b from-black via-gray-900 to-black font-sans md:px-10"
      ref={containerRef}
    >
      <div className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => {
          const isActive = index <= activeIndex;
          return (
            <div
              key={index}
              ref={el => {
                timelineRefs.current[index] = el;
              }}
              className="flex justify-start pt-10 md:pt-40 md:gap-10 opacity-0"
            >
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                <div 
                  className={`h-10 absolute left-3 md:left-3 w-10 rounded-full transition-all duration-500 ${
                    isActive ? 'bg-blue-500/20 scale-110' : 'bg-white dark:bg-black scale-100'
                  } flex items-center justify-center`}
                >
                  <div 
                    className={`h-4 w-4 rounded-full transition-all duration-500 ${
                      isActive ? 'bg-blue-500 border-blue-400 scale-120' : 'bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 scale-100'
                    } border p-2`}
                  />
                </div>
                <h3 className={`hidden md:block text-xl md:pl-20 md:text-5xl font-bold transition-colors duration-500 ${
                  isActive ? 'text-blue-400' : 'text-neutral-300 dark:text-neutral-500'
                }`}>
                  {item.title}
                </h3>
              </div>

              <div className="relative pl-20 pr-4 md:pl-4 w-full">
                <h3 className={`md:hidden block text-2xl mb-4 text-left font-bold transition-colors duration-500 ${
                  isActive ? 'text-blue-400' : 'text-neutral-500 dark:text-neutral-500'
                }`}>
                  {item.title}
                </h3>
                {item.content}
              </div>
            </div>
          );
        })}
        
        {/* Progress Line */}
        <div className="absolute md:left-8 left-8 top-0 h-full w-[2px] bg-neutral-800/50">
          <div
            ref={progressLineRef}
            className="w-full h-0 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-500/0"
          />
        </div>
      </div>
    </div>
  );
};
