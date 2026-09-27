// Kept in sync with the API contract in docs/ARCHITECTURE.md.

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

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function fetchWinProbability(matchId: string): Promise<WinProbabilityResponse> {
  const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/win-probability`);
  if (!response.ok) {
    throw new Error(`Match not found (${response.status})`);
  }
  return response.json();
}

export interface Me {
  steam_id: string | null;
}

export async function fetchMe(): Promise<Me> {
  const response = await fetch(`${API_BASE_URL}/api/me`, { credentials: "include" });
  return response.json();
}

export function steamLoginUrl(): string {
  return `${API_BASE_URL}/auth/steam/login`;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
}
