import { Route, Routes } from "react-router-dom";
import Backdrop from "@/components/site/Backdrop";
import SiteHeader from "@/components/site/SiteHeader";
import AnalysisPage from "@/pages/AnalysisPage";
import BuildsPage from "@/pages/BuildsPage";
import FaqPage from "@/pages/FaqPage";
import HomePage from "@/pages/HomePage";
import MatchPage from "@/pages/MatchPage";
import ModelPage from "@/pages/ModelPage";
import NewsPage from "@/pages/NewsPage";
import PlayerPage from "@/pages/PlayerPage";
import StatsPage from "@/pages/StatsPage";

function App() {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to Content
      </a>
      <SiteHeader />
      <div className="relative isolate flex flex-1 flex-col">
        <Backdrop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/match/:matchId" element={<MatchPage />} />
          <Route path="/match/:matchId/analysis" element={<AnalysisPage />} />
          <Route path="/player/:steamId" element={<PlayerPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/builds" element={<BuildsPage />} />
          <Route path="/model" element={<ModelPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </div>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <span translate="no">SoulCurve</span>
          <span>Not affiliated with Valve. Match data via deadlock-api.com.</span>
        </div>
      </footer>
    </>
  );
}

export default App;
