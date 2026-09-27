import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMatchAnalysis } from "../api";
import type { MatchAnalysisResponse } from "../api";

const MOMENT_LABELS: Record<string, string> = {
  death: "Death",
  objective_loss: "Objective lost",
  objective_win: "Objective won",
  good_trade: "Good trade",
  rotation: "Rotation",
};

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

  return (
    <main>
      <p>
        <Link to={`/match/${matchId}`}>&larr; Back to match</Link>
      </p>
      <h1>Match analysis</h1>

      {error && <p role="alert">{error}</p>}
      {!data && !error && <p>Loading...</p>}

      {data && (
        <>
          <p>
            <strong>{data.hero_name}</strong> &middot; score{" "}
            <span className="score-badge">{data.score.toFixed(1)}/10</span>
          </p>
          <p>{data.summary}</p>

          <h2>Moments</h2>
          <ul className="moment-list">
            {data.moments.map((moment) => (
              <li
                key={`${moment.t_min}-${moment.description}`}
                className={moment.wpa_delta < 0 ? "moment-negative" : "moment-positive"}
              >
                {moment.t_min} min — {MOMENT_LABELS[moment.type] ?? moment.type}:{" "}
                {moment.description} (
                {moment.wpa_delta > 0 ? "+" : ""}
                {Math.round(moment.wpa_delta * 100)}% win prob)
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default AnalysisPage;
