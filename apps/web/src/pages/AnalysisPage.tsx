import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMatchAnalysis } from "../api";
import type { MatchAnalysisResponse } from "../api";
import Panel from "../components/Panel";
import StatTile from "../components/StatTile";

const MOMENT_LABELS: Record<string, string> = {
  death: "Death",
  objective_loss: "Objective lost",
  objective_win: "Objective won",
  good_trade: "Good trade",
  rotation: "Rotation",
};

function formatDelta(delta: number) {
  const pct = Math.round(delta * 100);
  return `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${Math.abs(pct)}%`;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(10, score)) / 10) * circumference;
  return (
    <svg className="score-ring" viewBox="0 0 168 168" role="img" aria-label={`Score ${score} out of 10`}>
      <circle cx="84" cy="84" r={radius} fill="none" stroke="#1f2430" strokeWidth="12" />
      <circle
        cx="84"
        cy="84"
        r={radius}
        fill="none"
        stroke="#1d9cb8"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform="rotate(-90 84 84)"
      />
      <text x="84" y="88" textAnchor="middle" className="score-ring-value">
        {score.toFixed(1)}
      </text>
      <text x="84" y="112" textAnchor="middle" className="score-ring-max">
        out of 10
      </text>
    </svg>
  );
}

function AnalysisPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [data, setData] = useState<MatchAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    fetchMatchAnalysis(matchId)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const mistakes = data?.moments.filter((m) => m.wpa_delta < 0) ?? [];
  const goodPlays = data?.moments.filter((m) => m.wpa_delta > 0) ?? [];
  const lost = mistakes.reduce((sum, m) => sum + m.wpa_delta, 0);

  return (
    <main>
      <Link to={`/match/${matchId}`} className="back-link">
        &larr; Back to match
      </Link>
      <div className="page-head">
        <span className="eyebrow">Match analysis · #{matchId}</span>
        <h1>How you played</h1>
      </div>

      {error && <p role="alert">{error}</p>}
      {!data && !error && <p className="state-text">Analyzing match…</p>}

      {data && (
        <>
          <div className="grid grid-analysis">
            <Panel className="score-card">
              <ScoreRing score={data.score} />
              <div className="score-meta">
                <span className="chip chip-muted">{data.hero_name}</span>
                <p>{data.summary}</p>
              </div>
            </Panel>

            <Panel title="Key moments" subtitle="Each moment's effect on your team's win probability">
              <ul className="timeline">
                {data.moments.map((moment) => {
                  const bad = moment.wpa_delta < 0;
                  return (
                    <li key={`${moment.t_min}-${moment.description}`}>
                      <span className="timeline-time">{moment.t_min}m</span>
                      <span className="timeline-body">
                        <strong>{moment.description}</strong>
                        <span>
                          {bad ? "Mistake" : "Good play"} · {MOMENT_LABELS[moment.type] ?? moment.type}
                        </span>
                      </span>
                      <span className={`delta ${bad ? "delta-bad" : "delta-good"}`}>
                        {formatDelta(moment.wpa_delta)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </div>

          <div className="grid grid-3">
            <StatTile label="Mistakes" value={mistakes.length} />
            <StatTile label="Win prob. lost to mistakes" value={formatDelta(lost)} />
            <StatTile label="Good plays" value={goodPlays.length} />
          </div>
        </>
      )}
    </main>
  );
}

export default AnalysisPage;
