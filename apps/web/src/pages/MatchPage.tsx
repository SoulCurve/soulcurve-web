import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchWinProbability } from "../api";
import type { WinProbabilityResponse } from "../api";

function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [data, setData] = useState<WinProbabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    fetchWinProbability(matchId)
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
        <Link to="/">&larr; New search</Link>
      </p>
      <h1>Match {matchId}</h1>

      {error && <p role="alert">{error}</p>}
      {!data && !error && <p>Loading...</p>}

      {data && (
        <>
          <p>
            Model version: <code>{data.model_version}</code> · Winner:{" "}
            <strong>{data.winner}</strong>
          </p>
          <LineChart
            width={640}
            height={320}
            data={data.points}
            margin={{ top: 16, right: 16, bottom: 16, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t_min" type="number" domain={["dataMin", "dataMax"]} unit="min" />
            <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
            <Tooltip formatter={(value) => `${Math.round(Number(value) * 100)}%`} />
            <ReferenceLine y={0.5} strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="p_win"
              stroke="var(--accent)"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>

          <h2>Events</h2>
          <ul>
            {data.events.map((event) => (
              <li key={`${event.t_min}-${event.detail}`}>
                {event.t_min} min — {event.type}: {event.detail} ({event.team})
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default MatchPage;
