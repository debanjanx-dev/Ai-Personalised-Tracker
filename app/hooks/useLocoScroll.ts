"use client";

import { useEffect } from "react";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

export default function useLocoScroll(start: boolean) {
  useEffect(() => {
    if (!start) return;

    const scrollEl = document.querySelector("#main-container");
    
    const locoScroll = new LocomotiveScroll({
      el: scrollEl as HTMLElement,
      smooth: true,
      multiplier: 1,
      class: "is-revealed",
      direction: "vertical",
      smartphone: {
        smooth: true,
      },
      tablet: {
        smooth: true,
      },
    });

    // Handle any additional scroll-based animations
    locoScroll.on("scroll", (args: any) => {
      // You can add custom scroll-based animations here
    });

    // Cleanup
    return () => {
      if (locoScroll) locoScroll.destroy();
    };
  }, [start]);
} 