import { useEffect, useState } from "react";
import { fetchMe } from "@/api";

// "loading" until /api/me answers; null when signed out.
export function useSteamId() {
  const [steamId, setSteamId] = useState<string | null | "loading">("loading");

  useEffect(() => {
    fetchMe()
      .then((me) => setSteamId(me.steam_id))
      .catch(() => setSteamId(null));
  }, []);

  return [steamId, setSteamId] as const;
}
