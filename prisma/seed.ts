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
  { name: "Mexico", code: "MEX", flagCode: "mx", group: "A" },
  { name: "South Africa", code: "RSA", flagCode: "za", group: "A" },
  { name: "South Korea", code: "KOR", flagCode: "kr", group: "A" },
  { name: "Czechia", code: "CZE", flagCode: "cz", group: "A" },
  // Group B
  { name: "Canada", code: "CAN", flagCode: "ca", group: "B" },
  { name: "Switzerland", code: "SUI", flagCode: "ch", group: "B" },
  { name: "Qatar", code: "QAT", flagCode: "qa", group: "B" },
  { name: "Bosnia & Herzegovina", code: "BIH", flagCode: "ba", group: "B" },
  // Group C
  { name: "Brazil", code: "BRA", flagCode: "br", group: "C" },
  { name: "Morocco", code: "MAR", flagCode: "ma", group: "C" },
  { name: "Haiti", code: "HAI", flagCode: "ht", group: "C" },
  { name: "Scotland", code: "SCO", flagCode: "gb-sct", group: "C" },
  // Group D
  { name: "United States", code: "USA", flagCode: "us", group: "D" },
  { name: "Paraguay", code: "PAR", flagCode: "py", group: "D" },
  { name: "Australia", code: "AUS", flagCode: "au", group: "D" },
  { name: "Türkiye", code: "TUR", flagCode: "tr", group: "D" },
  // Group E
  { name: "Germany", code: "GER", flagCode: "de", group: "E" },
  { name: "Curaçao", code: "CUW", flagCode: "cw", group: "E" },
  { name: "Ivory Coast", code: "CIV", flagCode: "ci", group: "E" },
  { name: "Ecuador", code: "ECU", flagCode: "ec", group: "E" },
  // Group F
  { name: "Netherlands", code: "NED", flagCode: "nl", group: "F" },
  { name: "Japan", code: "JPN", flagCode: "jp", group: "F" },
  { name: "Sweden", code: "SWE", flagCode: "se", group: "F" },
  { name: "Tunisia", code: "TUN", flagCode: "tn", group: "F" },
  // Group G
  { name: "Belgium", code: "BEL", flagCode: "be", group: "G" },
  { name: "Egypt", code: "EGY", flagCode: "eg", group: "G" },
  { name: "Iran", code: "IRN", flagCode: "ir", group: "G" },
  { name: "New Zealand", code: "NZL", flagCode: "nz", group: "G" },
  // Group H
  { name: "Spain", code: "ESP", flagCode: "es", group: "H" },
  { name: "Cape Verde", code: "CPV", flagCode: "cv", group: "H" },
  { name: "Saudi Arabia", code: "KSA", flagCode: "sa", group: "H" },
  { name: "Uruguay", code: "URU", flagCode: "uy", group: "H" },
  // Group I
  { name: "France", code: "FRA", flagCode: "fr", group: "I" },
  { name: "Senegal", code: "SEN", flagCode: "sn", group: "I" },
  { name: "Norway", code: "NOR", flagCode: "no", group: "I" },
  { name: "Iraq", code: "IRQ", flagCode: "iq", group: "I" },
  // Group J
  { name: "Argentina", code: "ARG", flagCode: "ar", group: "J" },
  { name: "Algeria", code: "ALG", flagCode: "dz", group: "J" },
  { name: "Austria", code: "AUT", flagCode: "at", group: "J" },
  { name: "Jordan", code: "JOR", flagCode: "jo", group: "J" },
  // Group K
  { name: "Portugal", code: "POR", flagCode: "pt", group: "K" },
  { name: "DR Congo", code: "COD", flagCode: "cd", group: "K" },
  { name: "Uzbekistan", code: "UZB", flagCode: "uz", group: "K" },
  { name: "Colombia", code: "COL", flagCode: "co", group: "K" },
  // Group L
  { name: "England", code: "ENG", flagCode: "gb-eng", group: "L" },
  { name: "Croatia", code: "CRO", flagCode: "hr", group: "L" },
  { name: "Ghana", code: "GHA", flagCode: "gh", group: "L" },
  { name: "Panama", code: "PAN", flagCode: "pa", group: "L" },
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

// Group stage dates (3 matchdays per group)
// MD1: Jun 11-14, MD2: Jun 18-21, MD3: Jun 25-27 (simultaneous)
const GROUP_MATCHDAYS: Record<string, [string, string, string]> = {
  A: ["2026-06-11T20:00:00Z", "2026-06-18T18:00:00Z", "2026-06-25T22:00:00Z"],
  B: ["2026-06-12T18:00:00Z", "2026-06-19T15:00:00Z", "2026-06-26T18:00:00Z"],
  C: ["2026-06-12T22:00:00Z", "2026-06-19T22:00:00Z", "2026-06-26T22:00:00Z"],
  D: ["2026-06-13T00:00:00Z", "2026-06-20T15:00:00Z", "2026-06-27T18:00:00Z"],
  E: ["2026-06-13T18:00:00Z", "2026-06-20T18:00:00Z", "2026-06-27T22:00:00Z"],
  F: ["2026-06-13T22:00:00Z", "2026-06-20T22:00:00Z", "2026-06-27T22:00:00Z"],
  G: ["2026-06-14T15:00:00Z", "2026-06-21T15:00:00Z", "2026-06-25T18:00:00Z"],
  H: ["2026-06-14T18:00:00Z", "2026-06-21T18:00:00Z", "2026-06-25T22:00:00Z"],
  I: ["2026-06-14T22:00:00Z", "2026-06-21T22:00:00Z", "2026-06-26T18:00:00Z"],
  J: ["2026-06-11T15:00:00Z", "2026-06-18T15:00:00Z", "2026-06-26T22:00:00Z"],
  K: ["2026-06-11T22:00:00Z", "2026-06-18T22:00:00Z", "2026-06-25T18:00:00Z"],
  L: ["2026-06-12T15:00:00Z", "2026-06-19T18:00:00Z", "2026-06-25T22:00:00Z"],
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
    const [md1, md2, md3] = GROUP_MATCHDAYS[groupName as keyof typeof GROUP_MATCHDAYS];
    const groupId = groupMap[groupName];
    const [t0, t1, t2, t3] = groupTeams;

    const groupMatches = [
      // Matchday 1
      { home: t0.code, away: t1.code, date: md1, venueIdx: venueIndex++ },
      { home: t2.code, away: t3.code, date: md1, venueIdx: venueIndex++ },
      // Matchday 2
      { home: t0.code, away: t2.code, date: md2, venueIdx: venueIndex++ },
      { home: t1.code, away: t3.code, date: md2, venueIdx: venueIndex++ },
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

  // Knockout placeholder matches
  const tbd = teamMap["USA"]; // placeholder team for TBD slots
  const knockoutRounds = [
    {
      round: "Round of 32",
      matches: 16,
      dates: [
        "2026-06-30T15:00:00Z",
        "2026-06-30T19:00:00Z",
        "2026-07-01T15:00:00Z",
        "2026-07-01T19:00:00Z",
        "2026-07-02T15:00:00Z",
        "2026-07-02T19:00:00Z",
        "2026-07-03T15:00:00Z",
        "2026-07-03T19:00:00Z",
        "2026-07-04T15:00:00Z",
        "2026-07-04T19:00:00Z",
        "2026-07-05T15:00:00Z",
        "2026-07-05T19:00:00Z",
        "2026-07-06T15:00:00Z",
        "2026-07-06T19:00:00Z",
        "2026-07-07T15:00:00Z",
        "2026-07-07T19:00:00Z",
      ],
    },
    {
      round: "Round of 16",
      matches: 8,
      dates: [
        "2026-07-09T15:00:00Z",
        "2026-07-09T19:00:00Z",
        "2026-07-10T15:00:00Z",
        "2026-07-10T19:00:00Z",
        "2026-07-11T15:00:00Z",
        "2026-07-11T19:00:00Z",
        "2026-07-12T15:00:00Z",
        "2026-07-12T19:00:00Z",
      ],
    },
    {
      round: "Quarter-Finals",
      matches: 4,
      dates: [
        "2026-07-14T15:00:00Z",
        "2026-07-14T19:00:00Z",
        "2026-07-15T15:00:00Z",
        "2026-07-15T19:00:00Z",
      ],
    },
    {
      round: "Semi-Finals",
      matches: 2,
      dates: ["2026-07-17T19:00:00Z", "2026-07-18T19:00:00Z"],
    },
    {
      round: "Third Place",
      matches: 1,
      dates: ["2026-07-21T14:00:00Z"],
    },
    {
      round: "Final",
      matches: 1,
      dates: ["2026-07-22T19:00:00Z"],
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
