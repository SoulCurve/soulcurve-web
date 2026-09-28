import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import AuthStatus from "@/components/AuthStatus";
import BrandMark from "@/components/BrandMark";

const NAV = [
  { to: "/stats", label: "Stats" },
  { to: "/builds", label: "Builds" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/model", label: "Model" },
  { to: "/blog", label: "Blog" },
  { to: "/following", label: "Following" },
  { to: "/news", label: "News" },
  { to: "/faq", label: "FAQ" },
];

function SiteHeader() {
  const nav = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // On narrow screens the nav scrolls sideways; keep the current page's link in view.
  useEffect(() => {
    nav.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-foreground" translate="no">
          <BrandMark />
          <span className="display hidden text-base leading-none sm:inline">SoulCurve</span>
        </Link>
        <nav
          ref={nav}
          className="flex min-w-0 flex-1 self-stretch overflow-x-auto scroll-px-8 pr-8 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [scrollbar-width:none] sm:gap-1 lg:pr-0 lg:[mask-image:none]"
          aria-label="Main"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative flex shrink-0 items-center px-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:px-2.5",
                  isActive &&
                    "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-px after:bg-soul sm:after:inset-x-2.5",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <AuthStatus />
      </div>
    </header>
  );
}

export default SiteHeader;
