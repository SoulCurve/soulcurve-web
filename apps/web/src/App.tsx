import { Link, NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import AuthStatus from "./components/AuthStatus";
import BrandMark from "./components/BrandMark";
import AnalysisPage from "./pages/AnalysisPage";
import FaqPage from "./pages/FaqPage";
import HomePage from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";
import NewsPage from "./pages/NewsPage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand">
            <BrandMark />
            SoulCurve
          </Link>
          <nav className="site-nav">
            <NavLink to="/stats">Stats</NavLink>
            <NavLink to="/news">News</NavLink>
            <NavLink to="/faq">FAQ</NavLink>
          </nav>
          <AuthStatus />
        </div>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
        <Route path="/match/:matchId/analysis" element={<AnalysisPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/faq" element={<FaqPage />} />
      </Routes>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>SoulCurve · Deadlock stats &amp; coaching</span>
          <span>Not affiliated with Valve. Data via deadlock-api.com.</span>
        </div>
      </footer>
    </>
  );
}

export default App;
