import type { TournamentSummary } from "@/api";
import { Badge } from "@/components/ui/badge";

function TournamentStatusBadge({ status }: { status: TournamentSummary["status"] }) {
  return (
    <Badge variant={status === "live" ? "default" : "outline"} className="capitalize">
      {status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />}
      {status}
    </Badge>
  );
}

export default TournamentStatusBadge;
