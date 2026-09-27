import { useEffect, useState } from "react";
import { fetchMe, logout, steamLoginUrl } from "@/api";
import { Button, buttonVariants } from "@/components/ui/button";

function AuthStatus() {
  const [steamId, setSteamId] = useState<string | null | "loading">("loading");

  useEffect(() => {
    fetchMe()
      .then((me) => setSteamId(me.steam_id))
      .catch(() => setSteamId(null));
  }, []);

  async function handleLogout() {
    await logout();
    setSteamId(null);
  }

  if (steamId === "loading") return <div className="h-7 w-16 sm:w-36" aria-hidden="true" />;

  if (steamId) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline" translate="no">
          {steamId}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <a href={steamLoginUrl()} className={buttonVariants({ variant: "outline", size: "sm" })}>
      <span>
        Sign In<span className="hidden sm:inline"> with Steam</span>
      </span>
    </a>
  );
}

export default AuthStatus;
