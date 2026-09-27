import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

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
      <h1>SoulCurve</h1>
      <p>Deadlock maç kazanma olasılığı dashboard'u (Faz 1 MVP).</p>
      <form onSubmit={handleSubmit}>
        <input
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          placeholder="Maç ID"
          inputMode="numeric"
        />
        <button type="submit">Ara</button>
      </form>
    </main>
  );
}

export default HomePage;
