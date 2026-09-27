import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import AuthStatus from "./components/AuthStatus";
import AnalysisPage from "./pages/AnalysisPage";
import FaqPage from "./pages/FaqPage";
import HomePage from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";
import NewsPage from "./pages/NewsPage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/stats">Stats</Link>
          <Link to="/news">News</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
        <AuthStatus />
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
        <Route path="/match/:matchId/analysis" element={<AnalysisPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/faq" element={<FaqPage />} />
      </Routes>
    </>
  );
}

export default App;
