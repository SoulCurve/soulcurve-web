import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import AuthStatus from "./components/AuthStatus";
import HomePage from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/stats">Stats</Link>
        </nav>
        <AuthStatus />
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </>
  );
}

export default App;
