import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PageHeader, RouteTabs } from "@/components/site/primitives";

function MatchHeader({ matchId }: { matchId: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/"
        className="-ml-1 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        New Search
      </Link>
      <PageHeader title={`Match #${matchId}`} />
      <RouteTabs
        tabs={[
          { to: `/match/${matchId}`, label: "Overview", end: true },
          { to: `/match/${matchId}/analysis`, label: "Your Analysis" },
        ]}
      />
    </div>
  );
}

export default MatchHeader;
