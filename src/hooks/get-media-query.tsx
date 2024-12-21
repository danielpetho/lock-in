"use client";

import { useEffect, useState } from "react";

type MediaQuery = "default" | "sm" | "md" | "lg";

export function useMediaQuery() {
  const [mediaQuery, setMediaQuery] = useState<MediaQuery>("default");

  useEffect(() => {
    const checkMediaQuery = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMediaQuery("lg");
      } else if (window.matchMedia("(min-width: 768px)").matches) {
        setMediaQuery("md");
      } else if (window.matchMedia("(min-width: 640px)").matches) {
        setMediaQuery("sm");
      } else {
        setMediaQuery("default");
      }
    };

    // Initial check
    checkMediaQuery();

    // Add resize listener
    window.addEventListener("resize", checkMediaQuery);

    // Cleanup
    return () => window.removeEventListener("resize", checkMediaQuery);
  }, []);

  return mediaQuery;
}
