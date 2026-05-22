import type { StandingEntry } from "@/types";

type GroupWithResults = {
  teams: Array<{ id: string; name: string; code: string; flagCode: string }>;
  matches: Array<{
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number | null;
    awayScore: number | null;
    winner: "HOME" | "DRAW" | "AWAY" | null;
  }>;
};

export function buildGroupStandings(group: GroupWithResults): StandingEntry[] {
  type Tally = { w: number; d: number; l: number; gf: number; ga: number };
  const tally: Record<string, Tally> = {};

  for (const team of group.teams) {
    tally[team.id] = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  }

  for (const match of group.matches) {
    if (match.homeScore == null || match.awayScore == null || !match.winner) continue;

    const home = tally[match.homeTeamId];
    const away = tally[match.awayTeamId];

    home.gf += match.homeScore;
    home.ga += match.awayScore;
    away.gf += match.awayScore;
    away.ga += match.homeScore;

    if (match.winner === "HOME") {
      home.w++;
      away.l++;
    } else if (match.winner === "AWAY") {
      away.w++;
      home.l++;
    } else {
      home.d++;
      away.d++;
    }
  }

  return group.teams
    .map((team) => {
      const stats = tally[team.id];

      return {
        team,
        mp: stats.w + stats.d + stats.l,
        w: stats.w,
        d: stats.d,
        l: stats.l,
        gf: stats.gf,
        ga: stats.ga,
        gd: stats.gf - stats.ga,
        pts: stats.w * 3 + stats.d,
      };
    })
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));
}
