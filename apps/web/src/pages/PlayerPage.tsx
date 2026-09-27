import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PageHeader, PageShell } from "@/components/site/primitives";

function PlayerPage() {
  const { steamId = "" } = useParams<{ steamId: string }>();

  return (
    <PageShell>
      <Link
        to="/"
        className="-ml-1 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        New Search
      </Link>
      <PageHeader title={<span translate="no">Player {steamId}</span>} />
      <div className="deco-frame rounded-lg border bg-card p-6 text-sm text-pretty text-muted-foreground">
        Player profiles arrive with live match data. Until then, search by match ID to see a match breakdown.
      </div>
    </PageShell>
  );
}

export default PlayerPage;
