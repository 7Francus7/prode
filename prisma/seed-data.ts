export type GroupSeed = {
  name: string;
  label: string;
};

export type TeamSeed = {
  name: string;
  code: string;
  flagCode: string;
  group: string;
};

export type GroupMatchdays = {
  md1: [string, string];
  md2: [string, string];
  md3: string;
};

export type GroupStageMatchSeed = {
  group: string;
  round: string;
  home: string;
  away: string;
  date: string;
  externalId: string;
};

export const GROUPS: GroupSeed[] = [
  { name: "A", label: "Group A" },
  { name: "B", label: "Group B" },
  { name: "C", label: "Group C" },
  { name: "D", label: "Group D" },
  { name: "E", label: "Group E" },
  { name: "F", label: "Group F" },
  { name: "G", label: "Group G" },
  { name: "H", label: "Group H" },
  { name: "I", label: "Group I" },
  { name: "J", label: "Group J" },
  { name: "K", label: "Group K" },
  { name: "L", label: "Group L" },
];

export const TEAMS: TeamSeed[] = [
  { name: "México", code: "MEX", flagCode: "mx", group: "A" },
  { name: "Sudáfrica", code: "RSA", flagCode: "za", group: "A" },
  { name: "Corea del Sur", code: "KOR", flagCode: "kr", group: "A" },
  { name: "Chequia", code: "CZE", flagCode: "cz", group: "A" },
  { name: "Canadá", code: "CAN", flagCode: "ca", group: "B" },
  { name: "Bosnia y Herzegovina", code: "BIH", flagCode: "ba", group: "B" },
  { name: "Catar", code: "QAT", flagCode: "qa", group: "B" },
  { name: "Suiza", code: "SUI", flagCode: "ch", group: "B" },
  { name: "Brasil", code: "BRA", flagCode: "br", group: "C" },
  { name: "Marruecos", code: "MAR", flagCode: "ma", group: "C" },
  { name: "Haití", code: "HAI", flagCode: "ht", group: "C" },
  { name: "Escocia", code: "SCO", flagCode: "gb-sct", group: "C" },
  { name: "Estados Unidos", code: "USA", flagCode: "us", group: "D" },
  { name: "Paraguay", code: "PAR", flagCode: "py", group: "D" },
  { name: "Australia", code: "AUS", flagCode: "au", group: "D" },
  { name: "Turquía", code: "TUR", flagCode: "tr", group: "D" },
  { name: "Alemania", code: "GER", flagCode: "de", group: "E" },
  { name: "Curaçao", code: "CUW", flagCode: "cw", group: "E" },
  { name: "Costa de Marfil", code: "CIV", flagCode: "ci", group: "E" },
  { name: "Ecuador", code: "ECU", flagCode: "ec", group: "E" },
  { name: "Países Bajos", code: "NED", flagCode: "nl", group: "F" },
  { name: "Japón", code: "JPN", flagCode: "jp", group: "F" },
  { name: "Suecia", code: "SWE", flagCode: "se", group: "F" },
  { name: "Túnez", code: "TUN", flagCode: "tn", group: "F" },
  { name: "Bélgica", code: "BEL", flagCode: "be", group: "G" },
  { name: "Egipto", code: "EGY", flagCode: "eg", group: "G" },
  { name: "Irán", code: "IRN", flagCode: "ir", group: "G" },
  { name: "Nueva Zelanda", code: "NZL", flagCode: "nz", group: "G" },
  { name: "España", code: "ESP", flagCode: "es", group: "H" },
  { name: "Cabo Verde", code: "CPV", flagCode: "cv", group: "H" },
  { name: "Arabia Saudita", code: "KSA", flagCode: "sa", group: "H" },
  { name: "Uruguay", code: "URU", flagCode: "uy", group: "H" },
  { name: "Francia", code: "FRA", flagCode: "fr", group: "I" },
  { name: "Senegal", code: "SEN", flagCode: "sn", group: "I" },
  { name: "Irak", code: "IRQ", flagCode: "iq", group: "I" },
  { name: "Noruega", code: "NOR", flagCode: "no", group: "I" },
  { name: "Argentina", code: "ARG", flagCode: "ar", group: "J" },
  { name: "Argelia", code: "ALG", flagCode: "dz", group: "J" },
  { name: "Austria", code: "AUT", flagCode: "at", group: "J" },
  { name: "Jordania", code: "JOR", flagCode: "jo", group: "J" },
  { name: "Portugal", code: "POR", flagCode: "pt", group: "K" },
  { name: "Congo RD", code: "COD", flagCode: "cd", group: "K" },
  { name: "Uzbekistán", code: "UZB", flagCode: "uz", group: "K" },
  { name: "Colombia", code: "COL", flagCode: "co", group: "K" },
  { name: "Inglaterra", code: "ENG", flagCode: "gb-eng", group: "L" },
  { name: "Croacia", code: "CRO", flagCode: "hr", group: "L" },
  { name: "Ghana", code: "GHA", flagCode: "gh", group: "L" },
  { name: "Panamá", code: "PAN", flagCode: "pa", group: "L" },
];

export const GROUP_MATCHDAYS: Record<string, GroupMatchdays> = {
  A: {
    md1: ["2026-06-11T19:00:00Z", "2026-06-12T02:00:00Z"],
    md2: ["2026-06-19T01:00:00Z", "2026-06-18T16:00:00Z"],
    md3: "2026-06-25T01:00:00Z",
  },
  B: {
    md1: ["2026-06-12T19:00:00Z", "2026-06-13T19:00:00Z"],
    md2: ["2026-06-18T22:00:00Z", "2026-06-18T19:00:00Z"],
    md3: "2026-06-24T19:00:00Z",
  },
  C: {
    md1: ["2026-06-13T22:00:00Z", "2026-06-14T01:00:00Z"],
    md2: ["2026-06-20T00:30:00Z", "2026-06-19T22:00:00Z"],
    md3: "2026-06-24T22:00:00Z",
  },
  D: {
    md1: ["2026-06-13T02:00:00Z", "2026-06-14T05:00:00Z"],
    md2: ["2026-06-19T19:00:00Z", "2026-06-20T03:00:00Z"],
    md3: "2026-06-26T02:00:00Z",
  },
  E: {
    md1: ["2026-06-14T17:00:00Z", "2026-06-14T23:00:00Z"],
    md2: ["2026-06-20T20:00:00Z", "2026-06-21T00:00:00Z"],
    md3: "2026-06-25T20:00:00Z",
  },
  F: {
    md1: ["2026-06-14T20:00:00Z", "2026-06-15T02:00:00Z"],
    md2: ["2026-06-20T16:00:00Z", "2026-06-21T04:00:00Z"],
    md3: "2026-06-25T22:00:00Z",
  },
  G: {
    md1: ["2026-06-15T19:00:00Z", "2026-06-16T01:00:00Z"],
    md2: ["2026-06-21T19:00:00Z", "2026-06-22T01:00:00Z"],
    md3: "2026-06-27T03:00:00Z",
  },
  H: {
    md1: ["2026-06-15T16:00:00Z", "2026-06-15T22:00:00Z"],
    md2: ["2026-06-21T16:00:00Z", "2026-06-21T22:00:00Z"],
    md3: "2026-06-27T00:00:00Z",
  },
  I: {
    md1: ["2026-06-16T19:00:00Z", "2026-06-16T22:00:00Z"],
    md2: ["2026-06-22T21:00:00Z", "2026-06-23T00:00:00Z"],
    md3: "2026-06-26T19:00:00Z",
  },
  J: {
    md1: ["2026-06-17T01:00:00Z", "2026-06-17T04:00:00Z"],
    md2: ["2026-06-22T17:00:00Z", "2026-06-23T03:00:00Z"],
    md3: "2026-06-28T02:00:00Z",
  },
  K: {
    md1: ["2026-06-17T17:00:00Z", "2026-06-18T02:00:00Z"],
    md2: ["2026-06-23T17:00:00Z", "2026-06-24T02:00:00Z"],
    md3: "2026-06-27T23:30:00Z",
  },
  L: {
    md1: ["2026-06-17T20:00:00Z", "2026-06-17T23:00:00Z"],
    md2: ["2026-06-23T20:00:00Z", "2026-06-23T23:00:00Z"],
    md3: "2026-06-27T21:00:00Z",
  },
};

export function createGroupStageMatches(): GroupStageMatchSeed[] {
  return Object.entries(GROUP_MATCHDAYS).flatMap(([groupName, matchdays]) => {
    const groupTeams = TEAMS.filter((team) => team.group === groupName);

    if (groupTeams.length !== 4) {
      throw new Error(`Group ${groupName} must have exactly 4 teams, found ${groupTeams.length}`);
    }

    const [t0, t1, t2, t3] = groupTeams;

    return [
      { group: groupName, round: `Group ${groupName}`, home: t0.code, away: t1.code, date: matchdays.md1[0], externalId: `GROUP_${groupName}_${t0.code}_${t1.code}` },
      { group: groupName, round: `Group ${groupName}`, home: t2.code, away: t3.code, date: matchdays.md1[1], externalId: `GROUP_${groupName}_${t2.code}_${t3.code}` },
      { group: groupName, round: `Group ${groupName}`, home: t0.code, away: t2.code, date: matchdays.md2[0], externalId: `GROUP_${groupName}_${t0.code}_${t2.code}` },
      { group: groupName, round: `Group ${groupName}`, home: t1.code, away: t3.code, date: matchdays.md2[1], externalId: `GROUP_${groupName}_${t1.code}_${t3.code}` },
      { group: groupName, round: `Group ${groupName}`, home: t0.code, away: t3.code, date: matchdays.md3, externalId: `GROUP_${groupName}_${t0.code}_${t3.code}` },
      { group: groupName, round: `Group ${groupName}`, home: t1.code, away: t2.code, date: matchdays.md3, externalId: `GROUP_${groupName}_${t1.code}_${t2.code}` },
    ];
  });
}
