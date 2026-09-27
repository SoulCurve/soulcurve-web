import { useState } from "react";
import "./App.css";

// M4'te gerçek API'ye bağlanacak: GET /api/matches/{id}/win-probability
// Bkz. ../../docs/ARCHITECTURE.md

function App() {
  const [matchId, setMatchId] = useState("");

  return (
    <main>
      <h1>SoulCurve</h1>
      <p>Deadlock maç kazanma olasılığı dashboard'u (Faz 1 MVP).</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // TODO(M4): apps/api'deki /api/matches/{matchId}/win-probability çağrılacak
        }}
      >
        <input
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          placeholder="Maç ID"
        />
        <button type="submit">Ara</button>
      </form>
    </main>
  );
}

export default App;
