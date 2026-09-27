import { useParams } from "react-router-dom";
import { fetchMatchAnalysis } from "@/api";
import MatchHeader from "@/components/site/MatchHeader";
import { Delta, ErrorState, LoadingState, PageShell, Section, Stat } from "@/components/site/primitives";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/lib/useAsync";

const MOMENT_LABELS: Record<string, string> = {
  death: "Death",
  objective_loss: "Objective lost",
  objective_win: "Objective won",
  good_trade: "Good trade",
  rotation: "Rotation",
};

function ScoreDial({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(10, score)) / 10) * c;
  return (
    <svg viewBox="0 0 128 128" className="size-36" role="img" aria-label={`Score ${score.toFixed(1)} out of 10`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="var(--soul)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c}`}
        transform="rotate(-90 64 64)"
      />
      <text x="64" y="70" textAnchor="middle" className="fill-foreground font-mono text-[28px] font-medium">
        {score.toFixed(1)}
      </text>
      <text x="64" y="88" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px] tracking-[0.2em]">
        OUT OF 10
      </text>
    </svg>
  );
}

function AnalysisPage() {
  const { matchId = "" } = useParams<{ matchId: string }>();
  const { data, error } = useAsync(() => fetchMatchAnalysis(matchId), `analysis-${matchId}`);

  const mistakes = data?.moments.filter((m) => m.wpa_delta < 0) ?? [];
  const goodPlays = data?.moments.filter((m) => m.wpa_delta > 0) ?? [];
  const lost = mistakes.reduce((sum, m) => sum + m.wpa_delta, 0);
  const gained = goodPlays.reduce((sum, m) => sum + m.wpa_delta, 0);

  return (
    <PageShell>
      <MatchHeader matchId={matchId} />

      {error && <ErrorState message={`${error}. Check the match ID and try again.`} />}
      {!data && !error && <LoadingState label="Analyzing match…" />}

      {data && (
        <>
          <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
            <section className="deco-frame flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center lg:self-start">
              <span className="eyebrow">Match Score</span>
              <ScoreDial score={data.score} />
              <Badge variant="outline" className="font-mono uppercase tracking-wider">
                {data.hero_name}
              </Badge>
              <p className="text-sm text-pretty text-muted-foreground">{data.summary}</p>
            </section>

            <Section title="Key Moments" description="How each play moved your team’s win probability">
              <ol className="flex flex-col divide-y">
                {data.moments.map((moment) => {
                  const bad = moment.wpa_delta < 0;
                  return (
                    <li
                      key={`${moment.t_min}-${moment.description}`}
                      className="grid grid-cols-[3rem_1fr_auto] items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                      <span className="pt-0.5 font-mono text-sm text-muted-foreground tabular-nums">
                        {moment.t_min}m
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-sm">{moment.description}</span>
                        <span className="text-xs text-muted-foreground">
                          <span className={bad ? "text-bad" : "text-good"}>{bad ? "Mistake" : "Good play"}</span>
                          {" · "}
                          {MOMENT_LABELS[moment.type] ?? moment.type}
                        </span>
                      </span>
                      <Delta value={moment.wpa_delta} className="pt-0.5" />
                    </li>
                  );
                })}
              </ol>
            </Section>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Mistakes" value={mistakes.length} />
            <Stat label="Lost to Mistakes" value={<Delta value={lost} className="text-2xl" />} />
            <Stat label="Good Plays" value={goodPlays.length} />
            <Stat label="Gained" value={<Delta value={gained} className="text-2xl" />} />
          </div>
        </>
      )}
    </PageShell>
  );
}

export default AnalysisPage;
