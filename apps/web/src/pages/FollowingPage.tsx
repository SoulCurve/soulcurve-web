import { Link } from "react-router-dom";
import { UserMinus } from "lucide-react";
import { fetchPlayerMatches } from "@/api";
import { percent } from "@/chartTheme";
import GameIcon from "@/components/GameIcon";
import { ErrorState, PageHeader, PageShell, Section } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowing } from "@/lib/following";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

const RECENT = 5;

function FollowedPlayer({ steamId, onUnfollow }: { steamId: string; onUnfollow: () => void }) {
  const { data, error } = useAsync(() => fetchPlayerMatches(steamId), `player-matches-${steamId}`);
  const recent = data?.matches.slice(0, RECENT) ?? [];
  const wins = recent.filter((m) => m.result === "win").length;

  return (
    <Section
      title={steamId}
      description={data ? `${wins}-${recent.length - wins} in the last ${recent.length} · ${percent(wins / (recent.length || 1))} WR` : undefined}
      action={
        <Button size="icon-sm" variant="ghost" onClick={onUnfollow} aria-label={`Unfollow ${steamId}`}>
          <UserMinus />
        </Button>
      }
    >
      {error && <ErrorState message={error} />}
      {!data && !error && <Skeleton className="h-9 w-full" />}
      {data && (
        <div className="flex flex-col gap-4">
          <ol className="flex gap-1.5" aria-label="Recent results">
            {recent.map((match) => (
              <li key={match.match_id}>
                <Link
                  to={`/match/${match.match_id}/analysis`}
                  title={`${match.hero_name} · ${match.result} · ${match.kills}/${match.deaths}/${match.assists}`}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md border-b-2 bg-muted/40 hover:bg-muted",
                    match.result === "win" ? "border-good" : "border-bad",
                  )}
                >
                  <GameIcon name={match.hero_name} kind="hero" className="size-6" />
                </Link>
              </li>
            ))}
          </ol>
          <Link to={`/player/${steamId}`} className="w-fit text-sm text-soul hover:underline">
            View profile
          </Link>
        </div>
      )}
    </Section>
  );
}

function FollowingPage() {
  const following = useFollowing();

  return (
    <PageShell>
      <PageHeader
        title="Following"
        description="Players you follow and how their last few matches went. Saved in this browser."
      />
      {following.ids.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You're not following anyone yet.{" "}
          <Link to="/" className="text-soul hover:underline">
            Search for a player
          </Link>{" "}
          and press Follow on their profile.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {following.ids.map((id) => (
            <FollowedPlayer key={id} steamId={id} onUnfollow={() => following.toggle(id)} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default FollowingPage;
