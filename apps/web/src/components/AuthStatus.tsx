import { useEffect, useState } from "react";
import { fetchMe, logout, steamLoginUrl } from "../api";

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

  if (steamId === "loading") return null;

  return (
    <div className="auth-status">
      {steamId ? (
        <>
          <span>Signed in as {steamId}</span>
          <button type="button" onClick={handleLogout}>
            Sign out
          </button>
        </>
      ) : (
        <a className="button button-steam" href={steamLoginUrl()}>
          Sign in with Steam
        </a>
      )}
    </div>
  );
}

export default AuthStatus;
