import { createGroupStageMatches, GROUPS, GROUP_MATCHDAYS, TEAMS } from "./seed-data";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const groups = new Set(GROUPS.map((group) => group.name));
  const teamCodes = new Set(TEAMS.map((team) => team.code));
  const teamNames = new Set(TEAMS.map((team) => team.name));
  const matches = createGroupStageMatches();

  assert(GROUPS.length === 12, `Expected 12 groups, got ${GROUPS.length}`);
  assert(TEAMS.length === 48, `Expected 48 teams, got ${TEAMS.length}`);
  assert(teamCodes.size === TEAMS.length, "Team codes must be unique");
  assert(teamNames.size === TEAMS.length, "Team names must be unique");
  assert(Object.keys(GROUP_MATCHDAYS).length === GROUPS.length, "Each group must define matchdays");
  assert(matches.length === 72, `Expected 72 group-stage matches, got ${matches.length}`);

  for (const group of GROUPS) {
    const groupTeams = TEAMS.filter((team) => team.group === group.name);
    const groupMatches = matches.filter((match) => match.group === group.name);
    const uniquePairings = new Set(groupMatches.map((match) => `${match.home}-${match.away}`));

    assert(groups.has(group.name), `Unknown group ${group.name}`);
    assert(groupTeams.length === 4, `Group ${group.name} must have 4 teams`);
    assert(groupMatches.length === 6, `Group ${group.name} must have 6 matches`);
    assert(uniquePairings.size === 6, `Group ${group.name} has duplicate pairings`);
    assert(groupMatches.every((match) => groupTeams.some((team) => team.code === match.home)), `Group ${group.name} has invalid home team`);
    assert(groupMatches.every((match) => groupTeams.some((team) => team.code === match.away)), `Group ${group.name} has invalid away team`);
  }

  const externalIds = new Set(matches.map((match) => match.externalId));
  assert(externalIds.size === matches.length, "External IDs must be unique");

  const sortedDates = matches.map((match) => match.date).sort();
  assert(sortedDates[0] === "2026-06-11T19:00:00Z", `Unexpected first kickoff: ${sortedDates[0]}`);
  assert(sortedDates.at(-1) === "2026-06-28T02:00:00Z", `Unexpected last kickoff: ${sortedDates.at(-1)}`);

  console.log("Seed fixture OK");
  console.log(`Groups: ${GROUPS.length}`);
  console.log(`Teams: ${TEAMS.length}`);
  console.log(`Group-stage matches: ${matches.length}`);
}

main();
