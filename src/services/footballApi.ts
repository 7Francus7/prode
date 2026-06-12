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
  private readonly syncWindowDays = { from: -1, to: 1 };

  constructor(private apiKey: string) {}

  private async fetch<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "x-apisports-key": this.apiKey },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
    const data = await res.json();

    // API-Football devuelve 200 con un objeto `errors` cuando la key, el plan
    // o los parámetros no sirven. Sin esto, los fallos quedan como synced: 0.
    const apiErrors = data?.errors;
    if (apiErrors && !Array.isArray(apiErrors) && Object.keys(apiErrors).length > 0) {
      throw new Error(`API-Football: ${JSON.stringify(apiErrors)}`);
    }

    return data as T;
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
    const from = this.formatDateOffset(this.syncWindowDays.from);
    const to = this.formatDateOffset(this.syncWindowDays.to);
    const data = await this.fetch<{ response: ApiFixture[] }>(
      `/fixtures?league=1&season=2026&from=${from}&to=${to}`
    );
    return data.response.map(mapFixture);
  }

  private formatDateOffset(offsetDays: number): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offsetDays);
    return date.toISOString().split("T")[0];
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
    BT: "LIVE",
    P: "LIVE",
    SUSP: "LIVE",
    INT: "LIVE",
    FT: "FINISHED",
    AET: "FINISHED",
    PEN: "FINISHED",
  };

  return {
    externalId: String(f.fixture.id),
    homeTeamCode: mapTeamCode(f.teams.home),
    awayTeamCode: mapTeamCode(f.teams.away),
    matchDate: new Date(f.fixture.date),
    stadium: f.fixture.venue?.name ?? "",
    city: f.fixture.venue?.city ?? "",
    country: f.fixture.venue?.country ?? "",
    status: statusMap[f.fixture.status.short] ?? "SCHEDULED",
    homeScore: f.goals.home,
    awayScore: f.goals.away,
  };
}

function mapTeamCode(team: { code?: string | null; name?: string | null }): string {
  const code = team.code?.trim() ?? "";
  const name = team.name?.trim() ?? "";

  return (
    TEAM_CODE_ALIASES[normalizeTeamKey(code)] ??
    TEAM_CODE_ALIASES[normalizeTeamKey(name)] ??
    (code || name)
  );
}

function normalizeTeamKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const TEAM_CODE_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries({
    MEX: "MEX",
    Mexico: "MEX",
    RSA: "RSA",
    ZAF: "RSA",
    "South Africa": "RSA",
    KOR: "KOR",
    "South Korea": "KOR",
    CZE: "CZE",
    Czechia: "CZE",
    "Czech Republic": "CZE",
    CAN: "CAN",
    Canada: "CAN",
    BIH: "BIH",
    "Bosnia and Herzegovina": "BIH",
    QAT: "QAT",
    Qatar: "QAT",
    SUI: "SUI",
    Switzerland: "SUI",
    BRA: "BRA",
    Brazil: "BRA",
    MAR: "MAR",
    Morocco: "MAR",
    HAI: "HAI",
    Haiti: "HAI",
    SCO: "SCO",
    Scotland: "SCO",
    USA: "USA",
    "United States": "USA",
    "United States of America": "USA",
    PAR: "PAR",
    Paraguay: "PAR",
    AUS: "AUS",
    Australia: "AUS",
    TUR: "TUR",
    Turkey: "TUR",
    Turkiye: "TUR",
    GER: "GER",
    Germany: "GER",
    CUW: "CUW",
    Curacao: "CUW",
    CIV: "CIV",
    "Ivory Coast": "CIV",
    "Cote d'Ivoire": "CIV",
    Ecuador: "ECU",
    ECU: "ECU",
    NED: "NED",
    Netherlands: "NED",
    JPN: "JPN",
    Japan: "JPN",
    SWE: "SWE",
    Sweden: "SWE",
    TUN: "TUN",
    Tunisia: "TUN",
    BEL: "BEL",
    Belgium: "BEL",
    EGY: "EGY",
    Egypt: "EGY",
    IRN: "IRN",
    Iran: "IRN",
    NZL: "NZL",
    "New Zealand": "NZL",
    ESP: "ESP",
    Spain: "ESP",
    CPV: "CPV",
    "Cape Verde": "CPV",
    KSA: "KSA",
    "Saudi Arabia": "KSA",
    URU: "URU",
    Uruguay: "URU",
    FRA: "FRA",
    France: "FRA",
    SEN: "SEN",
    Senegal: "SEN",
    IRQ: "IRQ",
    Iraq: "IRQ",
    NOR: "NOR",
    Norway: "NOR",
    ARG: "ARG",
    Argentina: "ARG",
    ALG: "ALG",
    Algeria: "ALG",
    AUT: "AUT",
    Austria: "AUT",
    JOR: "JOR",
    Jordan: "JOR",
    POR: "POR",
    Portugal: "POR",
    COD: "COD",
    "DR Congo": "COD",
    "Congo DR": "COD",
    "Democratic Republic of the Congo": "COD",
    UZB: "UZB",
    Uzbekistan: "UZB",
    COL: "COL",
    Colombia: "COL",
    ENG: "ENG",
    England: "ENG",
    CRO: "CRO",
    Croatia: "CRO",
    GHA: "GHA",
    Ghana: "GHA",
    PAN: "PAN",
    Panama: "PAN",
  }).map(([key, value]) => [normalizeTeamKey(key), value])
);

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
