import { PrismaClient, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

const GROUPS = [
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

// flag codes = ISO 3166-1 alpha-2 country codes (for emoji flags)
const TEAMS = [
  // Group A
  { name: "México", code: "MEX", flagCode: "mx", group: "A" },
  { name: "Sudáfrica", code: "RSA", flagCode: "za", group: "A" },
  { name: "Corea del Sur", code: "KOR", flagCode: "kr", group: "A" },
  { name: "Chequia", code: "CZE", flagCode: "cz", group: "A" },
  // Group B
  { name: "Canadá", code: "CAN", flagCode: "ca", group: "B" },
  { name: "Suiza", code: "SUI", flagCode: "ch", group: "B" },
  { name: "Catar", code: "QAT", flagCode: "qa", group: "B" },
  { name: "Bosnia y Herzegovina", code: "BIH", flagCode: "ba", group: "B" },
  // Group C
  { name: "Brasil", code: "BRA", flagCode: "br", group: "C" },
  { name: "Marruecos", code: "MAR", flagCode: "ma", group: "C" },
  { name: "Haití", code: "HAI", flagCode: "ht", group: "C" },
  { name: "Escocia", code: "SCO", flagCode: "gb-sct", group: "C" },
  // Group D
  { name: "Estados Unidos", code: "USA", flagCode: "us", group: "D" },
  { name: "Paraguay", code: "PAR", flagCode: "py", group: "D" },
  { name: "Australia", code: "AUS", flagCode: "au", group: "D" },
  { name: "Turquía", code: "TUR", flagCode: "tr", group: "D" },
  // Group E
  { name: "Alemania", code: "GER", flagCode: "de", group: "E" },
  { name: "Curaçao", code: "CUW", flagCode: "cw", group: "E" },
  { name: "Costa de Marfil", code: "CIV", flagCode: "ci", group: "E" },
  { name: "Ecuador", code: "ECU", flagCode: "ec", group: "E" },
  // Group F
  { name: "Países Bajos", code: "NED", flagCode: "nl", group: "F" },
  { name: "Japón", code: "JPN", flagCode: "jp", group: "F" },
  { name: "Suecia", code: "SWE", flagCode: "se", group: "F" },
  { name: "Túnez", code: "TUN", flagCode: "tn", group: "F" },
  // Group G
  { name: "Bélgica", code: "BEL", flagCode: "be", group: "G" },
  { name: "Egipto", code: "EGY", flagCode: "eg", group: "G" },
  { name: "Irán", code: "IRN", flagCode: "ir", group: "G" },
  { name: "Nueva Zelanda", code: "NZL", flagCode: "nz", group: "G" },
  // Group H
  { name: "España", code: "ESP", flagCode: "es", group: "H" },
  { name: "Cabo Verde", code: "CPV", flagCode: "cv", group: "H" },
  { name: "Arabia Saudita", code: "KSA", flagCode: "sa", group: "H" },
  { name: "Uruguay", code: "URU", flagCode: "uy", group: "H" },
  // Group I
  { name: "Francia", code: "FRA", flagCode: "fr", group: "I" },
  { name: "Senegal", code: "SEN", flagCode: "sn", group: "I" },
  { name: "Noruega", code: "NOR", flagCode: "no", group: "I" },
  { name: "Irak", code: "IRQ", flagCode: "iq", group: "I" },
  // Group J
  { name: "Argentina", code: "ARG", flagCode: "ar", group: "J" },
  { name: "Argelia", code: "ALG", flagCode: "dz", group: "J" },
  { name: "Austria", code: "AUT", flagCode: "at", group: "J" },
  { name: "Jordania", code: "JOR", flagCode: "jo", group: "J" },
  // Group K
  { name: "Portugal", code: "POR", flagCode: "pt", group: "K" },
  { name: "Congo RD", code: "COD", flagCode: "cd", group: "K" },
  { name: "Uzbekistán", code: "UZB", flagCode: "uz", group: "K" },
  { name: "Colombia", code: "COL", flagCode: "co", group: "K" },
  // Group L
  { name: "Inglaterra", code: "ENG", flagCode: "gb-eng", group: "L" },
  { name: "Croacia", code: "CRO", flagCode: "hr", group: "L" },
  { name: "Ghana", code: "GHA", flagCode: "gh", group: "L" },
  { name: "Panamá", code: "PAN", flagCode: "pa", group: "L" },
];

const VENUES = [
  { stadium: "Estadio Azteca", city: "Mexico City", country: "Mexico" },
  { stadium: "Estadio AKRON", city: "Guadalajara", country: "Mexico" },
  { stadium: "Estadio BBVA", city: "Monterrey", country: "Mexico" },
  { stadium: "MetLife Stadium", city: "East Rutherford", country: "USA" },
  { stadium: "AT&T Stadium", city: "Arlington", country: "USA" },
  { stadium: "SoFi Stadium", city: "Inglewood", country: "USA" },
  { stadium: "Levi's Stadium", city: "Santa Clara", country: "USA" },
  { stadium: "Rose Bowl", city: "Pasadena", country: "USA" },
  { stadium: "Arrowhead Stadium", city: "Kansas City", country: "USA" },
  { stadium: "Lincoln Financial Field", city: "Philadelphia", country: "USA" },
  { stadium: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA" },
  { stadium: "Gillette Stadium", city: "Foxborough", country: "USA" },
  { stadium: "Hard Rock Stadium", city: "Miami Gardens", country: "USA" },
  { stadium: "NRG Stadium", city: "Houston", country: "USA" },
  { stadium: "BC Place", city: "Vancouver", country: "Canada" },
  { stadium: "BMO Field", city: "Toronto", country: "Canada" },
];

// Official FIFA World Cup 2026 schedule (UTC).
// md1/md2: [game1_UTC, game2_UTC] — each matchday has 2 different kickoff times.
// md3: single UTC time — both games kick off simultaneously.
// Teams order per group: [t0, t1, t2, t3]
// MD1 pairings: t0 vs t1, t2 vs t3
// MD2 pairings: t0 vs t2, t1 vs t3
// MD3 pairings: t0 vs t3, t1 vs t2 (simultaneous)
const GROUP_MATCHDAYS: Record<
  string,
  { md1: [string, string]; md2: [string, string]; md3: string }
> = {
  // A: México(t0), Sudáfrica(t1), Corea del Sur(t2), Chequia(t3)
  A: {
    md1: ["2026-06-11T19:00:00Z", "2026-06-12T02:00:00Z"],
    md2: ["2026-06-19T01:00:00Z", "2026-06-18T16:00:00Z"],
    md3: "2026-06-25T01:00:00Z",
  },
  // B: Canadá(t0), Suiza(t1), Catar(t2), Bosnia y Herzegovina(t3)
  B: {
    md1: ["2026-06-12T19:00:00Z", "2026-06-13T19:00:00Z"],
    md2: ["2026-06-18T22:00:00Z", "2026-06-18T19:00:00Z"],
    md3: "2026-06-24T19:00:00Z",
  },
  // C: Brasil(t0), Marruecos(t1), Haití(t2), Escocia(t3)
  C: {
    md1: ["2026-06-13T22:00:00Z", "2026-06-14T01:00:00Z"],
    md2: ["2026-06-20T00:30:00Z", "2026-06-19T22:00:00Z"],
    md3: "2026-06-24T22:00:00Z",
  },
  // D: Estados Unidos(t0), Paraguay(t1), Australia(t2), Turquía(t3)
  D: {
    md1: ["2026-06-13T02:00:00Z", "2026-06-14T05:00:00Z"],
    md2: ["2026-06-19T19:00:00Z", "2026-06-20T03:00:00Z"],
    md3: "2026-06-26T02:00:00Z",
  },
  // E: Alemania(t0), Curaçao(t1), Costa de Marfil(t2), Ecuador(t3)
  E: {
    md1: ["2026-06-14T17:00:00Z", "2026-06-14T23:00:00Z"],
    md2: ["2026-06-20T20:00:00Z", "2026-06-21T00:00:00Z"],
    md3: "2026-06-25T20:00:00Z",
  },
  // F: Países Bajos(t0), Japón(t1), Suecia(t2), Túnez(t3)
  F: {
    md1: ["2026-06-14T20:00:00Z", "2026-06-15T02:00:00Z"],
    md2: ["2026-06-20T16:00:00Z", "2026-06-21T04:00:00Z"],
    md3: "2026-06-25T22:00:00Z",
  },
  // G: Bélgica(t0), Egipto(t1), Irán(t2), Nueva Zelanda(t3)
  G: {
    md1: ["2026-06-15T19:00:00Z", "2026-06-16T01:00:00Z"],
    md2: ["2026-06-21T19:00:00Z", "2026-06-22T01:00:00Z"],
    md3: "2026-06-27T03:00:00Z",
  },
  // H: España(t0), Cabo Verde(t1), Arabia Saudita(t2), Uruguay(t3)
  H: {
    md1: ["2026-06-15T16:00:00Z", "2026-06-15T22:00:00Z"],
    md2: ["2026-06-21T16:00:00Z", "2026-06-21T22:00:00Z"],
    md3: "2026-06-27T00:00:00Z",
  },
  // I: Francia(t0), Senegal(t1), Noruega(t2), Irak(t3)
  I: {
    md1: ["2026-06-16T19:00:00Z", "2026-06-16T22:00:00Z"],
    md2: ["2026-06-22T21:00:00Z", "2026-06-23T00:00:00Z"],
    md3: "2026-06-26T19:00:00Z",
  },
  // J: Argentina(t0), Argelia(t1), Austria(t2), Jordania(t3)
  J: {
    md1: ["2026-06-17T01:00:00Z", "2026-06-17T04:00:00Z"],
    md2: ["2026-06-22T17:00:00Z", "2026-06-23T03:00:00Z"],
    md3: "2026-06-28T02:00:00Z",
  },
  // K: Portugal(t0), Congo RD(t1), Uzbekistán(t2), Colombia(t3)
  K: {
    md1: ["2026-06-17T17:00:00Z", "2026-06-18T02:00:00Z"],
    md2: ["2026-06-23T17:00:00Z", "2026-06-24T02:00:00Z"],
    md3: "2026-06-27T23:30:00Z",
  },
  // L: Inglaterra(t0), Croacia(t1), Ghana(t2), Panamá(t3)
  L: {
    md1: ["2026-06-17T20:00:00Z", "2026-06-17T23:00:00Z"],
    md2: ["2026-06-23T20:00:00Z", "2026-06-23T23:00:00Z"],
    md3: "2026-06-27T21:00:00Z",
  },
};

function getVenue(index: number) {
  return VENUES[index % VENUES.length];
}

async function main() {
  console.log("🌍 Seeding World Cup 2026 data...");

  // Clear existing data to avoid stale teams
  await prisma.predictionPoints.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();
  console.log("🗑️  Cleared existing data");

  // Groups
  const groupMap: Record<string, string> = {};
  for (const g of GROUPS) {
    const group = await prisma.group.create({ data: g });
    groupMap[g.name] = group.id;
  }
  console.log(`✅ ${GROUPS.length} groups created`);

  // Teams
  const teamMap: Record<string, string> = {};
  for (const t of TEAMS) {
    const team = await prisma.team.create({
      data: {
        name: t.name,
        code: t.code,
        flagCode: t.flagCode,
        groupId: groupMap[t.group],
      },
    });
    teamMap[t.code] = team.id;
  }
  console.log(`✅ ${TEAMS.length} teams created`);

  // Generate group stage matches
  let matchCount = 0;
  let venueIndex = 0;

  for (const groupName of Object.keys(GROUP_MATCHDAYS)) {
    const groupTeams = TEAMS.filter((t) => t.group === groupName);
    const { md1, md2, md3 } = GROUP_MATCHDAYS[groupName as keyof typeof GROUP_MATCHDAYS];
    const groupId = groupMap[groupName];
    const [t0, t1, t2, t3] = groupTeams;

    const groupMatches = [
      // Matchday 1
      { home: t0.code, away: t1.code, date: md1[0], venueIdx: venueIndex++ },
      { home: t2.code, away: t3.code, date: md1[1], venueIdx: venueIndex++ },
      // Matchday 2
      { home: t0.code, away: t2.code, date: md2[0], venueIdx: venueIndex++ },
      { home: t1.code, away: t3.code, date: md2[1], venueIdx: venueIndex++ },
      // Matchday 3 (simultaneous)
      { home: t0.code, away: t3.code, date: md3, venueIdx: venueIndex++ },
      { home: t1.code, away: t2.code, date: md3, venueIdx: venueIndex++ },
    ];

    for (const m of groupMatches) {
      const venue = getVenue(m.venueIdx);
      await prisma.match.create({
        data: {
          homeTeamId: teamMap[m.home],
          awayTeamId: teamMap[m.away],
          groupId,
          matchDate: new Date(m.date),
          stadium: venue.stadium,
          city: venue.city,
          country: venue.country,
          status: MatchStatus.SCHEDULED,
          round: `Group ${groupName}`,
          externalId: `GROUP_${groupName}_${m.home}_${m.away}`,
        },
      });
      matchCount++;
    }
  }
  console.log(`✅ ${matchCount} group stage matches created`);

  // Knockout placeholder matches — official FIFA dates (UTC)
  const tbd = teamMap["USA"]; // placeholder team for TBD slots
  const knockoutRounds = [
    {
      round: "Round of 32",
      matches: 16,
      dates: [
        "2026-06-28T19:00:00Z",
        "2026-06-29T20:00:00Z",
        "2026-06-29T20:30:00Z",
        "2026-06-29T21:00:00Z",
        "2026-06-30T01:00:00Z",
        "2026-06-30T17:00:00Z",
        "2026-07-01T01:00:00Z",
        "2026-07-01T16:00:00Z",
        "2026-07-01T20:00:00Z",
        "2026-07-01T22:00:00Z",
        "2026-07-02T19:00:00Z",
        "2026-07-02T23:00:00Z",
        "2026-07-03T03:00:00Z",
        "2026-07-03T18:00:00Z",
        "2026-07-03T22:00:00Z",
        "2026-07-04T01:30:00Z",
      ],
    },
    {
      round: "Round of 16",
      matches: 8,
      dates: [
        "2026-07-04T17:00:00Z",
        "2026-07-04T21:00:00Z",
        "2026-07-05T20:00:00Z",
        "2026-07-05T22:00:00Z",
        "2026-07-06T19:00:00Z",
        "2026-07-06T22:00:00Z",
        "2026-07-07T16:00:00Z",
        "2026-07-07T20:00:00Z",
      ],
    },
    {
      round: "Quarter-Finals",
      matches: 4,
      dates: [
        "2026-07-09T20:00:00Z",
        "2026-07-10T19:00:00Z",
        "2026-07-11T21:00:00Z",
        "2026-07-12T00:00:00Z",
      ],
    },
    {
      round: "Semi-Finals",
      matches: 2,
      dates: ["2026-07-14T18:00:00Z", "2026-07-15T19:00:00Z"],
    },
    {
      round: "Third Place",
      matches: 1,
      dates: ["2026-07-18T21:00:00Z"],
    },
    {
      round: "Final",
      matches: 1,
      dates: ["2026-07-19T19:00:00Z"],
    },
  ];

  let knockoutCount = 0;
  for (const stage of knockoutRounds) {
    for (let i = 0; i < stage.matches; i++) {
      const extId = `KNOCKOUT_${stage.round.replace(/\s/g, "_").toUpperCase()}_${i + 1}`;
      const venue = getVenue(venueIndex++);
      await prisma.match.create({
        data: {
          homeTeamId: tbd,
          awayTeamId: tbd,
          matchDate: new Date(stage.dates[i]),
          stadium: venue.stadium,
          city: venue.city,
          country: venue.country,
          status: MatchStatus.SCHEDULED,
          round: stage.round,
          externalId: extId,
        },
      });
      knockoutCount++;
    }
  }
  console.log(`✅ ${knockoutCount} knockout placeholder matches created`);
  console.log(`\n🏆 Seed complete! Total: ${matchCount + knockoutCount} matches`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
