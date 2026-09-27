import { useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BACKDROPS = ["/bg/sanctum.webp", "/bg/alley.webp"];

// Darkened game art at the top of every page: full strength behind the home hero,
// a faint wash elsewhere. The gradient hands off to the page grid below.
function Backdrop() {
  const { pathname } = useLocation();
  const [src] = useState(() => BACKDROPS[Math.floor(Math.random() * BACKDROPS.length)]);
  const hero = pathname === "/";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden",
        hero ? "h-[34rem] sm:h-[38rem]" : "h-[22rem] sm:h-[26rem]",
      )}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        className={cn("size-full object-cover grayscale-[35%]", hero ? "opacity-40" : "opacity-20")}
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
    </div>
  );
}

export default Backdrop;
