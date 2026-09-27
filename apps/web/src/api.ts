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

export interface HeroStat {
  hero_id: number;
  name: string;
  win_rate: number;
  pick_rate: number;
}

export interface HeroStatsResponse {
  patch: string;
  heroes: HeroStat[];
}

export interface ItemStat {
  item_id: number;
  name: string;
  win_rate: number;
  pick_rate: number;
}

export interface HeroItemStatsResponse {
  patch: string;
  hero_id: number;
  hero_name: string;
  items: ItemStat[];
}

export async function fetchHeroStats(): Promise<HeroStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stats/heroes`);
  if (!response.ok) {
    throw new Error(`Failed to load hero stats (${response.status})`);
  }
  return response.json();
}

export async function fetchHeroItemStats(heroId: number): Promise<HeroItemStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stats/heroes/${heroId}/items`);
  if (!response.ok) {
    throw new Error(`Failed to load item stats (${response.status})`);
  }
  return response.json();
}

export interface PlayerMoment {
  t_min: number;
  type: "death" | "objective_loss" | "objective_win" | "good_trade" | "rotation";
  description: string;
  wpa_delta: number;
}

export interface MatchAnalysisResponse {
  match_id: number;
  player_id: string;
  hero_name: string;
  score: number;
  summary: string;
  moments: PlayerMoment[];
}

export async function fetchMatchAnalysis(matchId: string): Promise<MatchAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/analysis`);
  if (!response.ok) {
    throw new Error(`Match not found (${response.status})`);
  }
  return response.json();
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  tag: "patch-notes" | "news";
  summary: string;
}

export interface NewsResponse {
  items: NewsItem[];
}

export async function fetchNews(): Promise<NewsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/news`);
  if (!response.ok) {
    throw new Error(`Failed to load news (${response.status})`);
  }
  return response.json();
}
