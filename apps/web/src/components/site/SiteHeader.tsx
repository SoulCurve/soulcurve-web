import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import AuthStatus from "@/components/AuthStatus";
import BrandMark from "@/components/BrandMark";

const NAV = [
  { to: "/stats", label: "Stats" },
  { to: "/builds", label: "Builds" },
  { to: "/model", label: "Model" },
  { to: "/news", label: "News" },
  { to: "/faq", label: "FAQ" },
];

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-foreground" translate="no">
          <BrandMark />
          <span className="display text-base leading-none">SoulCurve</span>
        </Link>
        <nav className="flex flex-1 items-center sm:gap-1" aria-label="Main">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative px-2 py-1.5 sm:px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  isActive &&
                    "text-foreground after:absolute after:inset-x-2 sm:after:inset-x-2.5 after:-bottom-[13px] after:h-px after:bg-soul",
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
