import type { Match, Team, Group, Prediction, PredictionPoints } from "@prisma/client";
import type { PredictionResult } from "@prisma/client";

export type MatchWithTeams = Match & {
  homeTeam: Team;
  awayTeam: Team;
  group: Group | null;
  myPrediction?: PredictionResult | null;
  isLocked?: boolean;
  predictionBreakdown?: PredictionBreakdown;
};

export type PredictionBreakdown = Record<PredictionResult, number>;

export type PickEntry = {
  userId: string;
  name: string | null;
  image: string | null;
  prediction: PredictionResult;
  correct: boolean | null;
};

export type StandingEntry = {
  team: { id: string; name: string; code: string; flagCode: string };
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
};

export type PredictionWithMatch = Prediction & {
  match: MatchWithTeams;
  predictionPoints?: PredictionPoints | null;
};

export type RankingEntry = {
  rank: number;
  id: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  accuracy: number | null;
  todayPoints?: number;
};

export type SyncResult = {
  synced: number;
  updated: number;
  pointsCalculated: number;
  errors: string[];
};
