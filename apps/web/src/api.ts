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
  rank: string | null;
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

export interface ItemsResponse {
  patch: string;
  items: ItemStat[];
}

export async function fetchItemStats(): Promise<ItemsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stats/items`);
  if (!response.ok) {
    throw new Error(`Failed to load item stats (${response.status})`);
  }
  return response.json();
}

export async function fetchHeroStats(rank?: string | null): Promise<HeroStatsResponse> {
  const query = rank ? `?rank=${encodeURIComponent(rank)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/stats/heroes${query}`);
  if (!response.ok) {
    throw new Error(`Failed to load hero stats (${response.status})`);
  }
  return response.json();
}

export async function fetchRanks(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/stats/ranks`);
  if (!response.ok) {
    throw new Error(`Failed to load ranks (${response.status})`);
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

export interface Build {
  build_id: number;
  author: string;
  items: string[];
  win_rate: number;
  games: number;
}

export interface HeroBuildsResponse {
  patch: string;
  hero_id: number;
  hero_name: string;
  builds: Build[];
}

export async function fetchHeroBuilds(heroId: number): Promise<HeroBuildsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stats/heroes/${heroId}/builds`);
  if (!response.ok) {
    throw new Error(`Failed to load builds (${response.status})`);
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

export interface MatchSummary {
  match_id: number;
  hero_id: number;
  hero_name: string;
  result: "win" | "loss";
  kills: number;
  deaths: number;
  assists: number;
  duration_min: number;
  played_at: string;
}

export interface PlayerMatchesResponse {
  steam_id: string;
  matches: MatchSummary[];
}

export async function fetchPlayerMatches(steamId: string): Promise<PlayerMatchesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/players/${encodeURIComponent(steamId)}/matches`);
  if (!response.ok) {
    throw new Error(`Failed to load match history (${response.status})`);
  }
  return response.json();
}

export interface ModelMetric {
  label: string;
  value: string;
  description: string;
}

export interface ModelInfoResponse {
  model_version: string;
  trained_at: string;
  training_matches: number;
  training_patch_range: string;
  algorithm: string;
  metrics: ModelMetric[];
  features: string[];
  summary: string;
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/model`);
  if (!response.ok) {
    throw new Error(`Failed to load model info (${response.status})`);
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

export interface BlogPostSummary {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
}

export interface BlogPost extends BlogPostSummary {
  body: string;
}

export interface BlogListResponse {
  posts: BlogPostSummary[];
}

export async function fetchBlogList(): Promise<BlogListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/blog`);
  if (!response.ok) {
    throw new Error(`Failed to load blog posts (${response.status})`);
  }
  return response.json();
}

export async function fetchBlogPost(slug: string): Promise<BlogPost> {
  const response = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new Error(`Post not found (${response.status})`);
  }
  return response.json();
}
