"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

export default function HeaderVisibility() {
  const lastScrollY = useRef(0);

  useLenis(({ scroll }) => {
    // Always show the header near the top.
    if (scroll <= 150) {
      document.body.classList.remove("header-hidden");
    } else if (scroll > lastScrollY.current) {
      // Scrolling DOWN
      document.body.classList.add("header-hidden");
    } else {
      // Scrolling UP
      document.body.classList.remove("header-hidden");
    }
    lastScrollY.current = scroll;
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("header-hidden");
    };
  }, []);

  return null;
}