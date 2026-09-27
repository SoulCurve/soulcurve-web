// docs/ARCHITECTURE.md'deki API sözleşmesiyle senkron tutulur.

export interface WinProbabilityPoint {
  t_min: number;
  p_win: number;
}

export interface MatchEvent {
  t_min: number;
  type: string;
  detail: string;
  team: string;
}

export interface WinProbabilityResponse {
  match_id: number;
  model_version: string;
  team_perspective: "amber" | "sapphire";
  points: WinProbabilityPoint[];
  events: MatchEvent[];
  winner: "amber" | "sapphire";
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function fetchWinProbability(matchId: string): Promise<WinProbabilityResponse> {
  const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/win-probability`);
  if (!response.ok) {
    throw new Error(`Maç bulunamadı (${response.status})`);
  }
  return response.json();
}
