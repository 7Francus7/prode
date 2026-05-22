import { env } from "@/lib/env";

export interface ExternalMatch {
  externalId: string;
  homeTeamCode: string;
  awayTeamCode: string;
  matchDate: Date;
  stadium: string;
  city: string;
  country: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  homeScore: number | null;
  awayScore: number | null;
}

export interface FootballApiProvider {
  getWorldCupMatches(season: number): Promise<ExternalMatch[]>;
  getLiveMatches(): Promise<ExternalMatch[]>;
  getTodayMatches(): Promise<ExternalMatch[]>;
}

export class ApiFootballProvider implements FootballApiProvider {
  private readonly baseUrl = "https://v3.football.api-sports.io";

  constructor(private apiKey: string) {}

  private async fetch<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "x-apisports-key": this.apiKey },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
    return res.json();
  }

  async getWorldCupMatches(season: number): Promise<ExternalMatch[]> {
    // FIFA World Cup = league 1 in api-football
    const data = await this.fetch<{ response: ApiFixture[] }>(
      `/fixtures?league=1&season=${season}`
    );
    return data.response.map(mapFixture);
  }

  async getLiveMatches(): Promise<ExternalMatch[]> {
    const data = await this.fetch<{ response: ApiFixture[] }>(
      "/fixtures?league=1&live=all"
    );
    return data.response.map(mapFixture);
  }

  async getTodayMatches(): Promise<ExternalMatch[]> {
    const today = new Date().toISOString().split("T")[0];
    const data = await this.fetch<{ response: ApiFixture[] }>(
      `/fixtures?league=1&season=2026&from=${today}&to=${today}`
    );
    return data.response.map(mapFixture);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiFixture = any;

function mapFixture(f: ApiFixture): ExternalMatch {
  const statusMap: Record<string, ExternalMatch["status"]> = {
    NS: "SCHEDULED",
    "1H": "LIVE",
    HT: "LIVE",
    "2H": "LIVE",
    ET: "LIVE",
    P: "LIVE",
    FT: "FINISHED",
    AET: "FINISHED",
    PEN: "FINISHED",
  };

  return {
    externalId: String(f.fixture.id),
    homeTeamCode: (f.teams.home.code ?? f.teams.home.name) as string,
    awayTeamCode: (f.teams.away.code ?? f.teams.away.name) as string,
    matchDate: new Date(f.fixture.date),
    stadium: f.fixture.venue?.name ?? "",
    city: f.fixture.venue?.city ?? "",
    country: f.fixture.venue?.country ?? "",
    status: statusMap[f.fixture.status.short] ?? "SCHEDULED",
    homeScore: f.goals.home,
    awayScore: f.goals.away,
  };
}

export class MockFootballProvider implements FootballApiProvider {
  async getWorldCupMatches(): Promise<ExternalMatch[]> {
    return [];
  }
  async getLiveMatches(): Promise<ExternalMatch[]> {
    return [];
  }
  async getTodayMatches(): Promise<ExternalMatch[]> {
    return [];
  }
}

export function createFootballApiProvider(): FootballApiProvider {
  const key = env.FOOTBALL_API_KEY;
  if (!key || key === "mock") return new MockFootballProvider();
  return new ApiFootballProvider(key);
}
