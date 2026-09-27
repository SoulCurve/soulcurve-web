import { Route, Routes } from "react-router-dom";
import "./App.css";
import AuthStatus from "./components/AuthStatus";
import HomePage from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";

function App() {
  return (
    <>
      <header>
        <AuthStatus />
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
      </Routes>
    </>
  );
}

export default App;
