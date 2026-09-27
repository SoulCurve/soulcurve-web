import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

const FEATURES: { title: string; body: string; to: string; cta: string; icon: ReactNode }[] = [
  {
    title: "Win probability",
    body: "See how every fight, objective and death moved your team's chance to win, minute by minute.",
    to: "/match/1",
    cta: "Open a sample match",
    icon: (
      <path d="M3 17 L9 11 L13 14 L21 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Mistake score",
    body: "A 0–10 score for your match, with the exact moments that cost your team the most.",
    to: "/match/1/analysis",
    cta: "See a sample analysis",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8 V12 L15 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Hero & item stats",
    body: "Patch-by-patch hero win rates and the items that actually win games on each hero.",
    to: "/stats",
    cta: "Browse stats",
    icon: (
      <path d="M5 20 V11 M12 20 V5 M19 20 V14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    ),
  },
];

function HomePage() {
  const [matchId, setMatchId] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (matchId.trim()) {
      navigate(`/match/${matchId.trim()}`);
    }
  }

  return (
    <main>
      <section className="hero">
        <span className="chip">Deadlock analytics</span>
        <h1>
          Know exactly <span>where the game turned.</span>
        </h1>
        <p>
          Win probability, a per-match mistake score and patch-by-patch hero stats for Deadlock.
        </p>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Enter a match ID"
            inputMode="numeric"
            aria-label="Match ID"
          />
          <button type="submit">Analyze</button>
        </form>
      </section>

      <div className="grid grid-3">
        {FEATURES.map((feature) => (
          <Link key={feature.title} to={feature.to} className="panel feature-card">
            <span className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                {feature.icon}
              </svg>
            </span>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
            <span className="back-link">{feature.cta} &rarr;</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default HomePage;
