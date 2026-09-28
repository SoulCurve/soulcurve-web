import { Link, NavLink } from "react-router-dom";
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
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-foreground" translate="no">
          <BrandMark />
          <span className="display hidden text-base leading-none sm:inline">SoulCurve</span>
        </Link>
        <nav
          className="flex min-w-0 flex-1 self-stretch overflow-x-auto [scrollbar-width:none] sm:gap-1"
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
