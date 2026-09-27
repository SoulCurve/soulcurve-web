import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/match/:matchId" element={<MatchPage />} />
    </Routes>
  );
}

export default App;
