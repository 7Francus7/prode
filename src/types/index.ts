import type { Match, Team, Group, Prediction, PredictionPoints } from "@prisma/client";
import type { PredictionResult } from "@prisma/client";

export type MatchWithTeams = Match & {
  homeTeam: Team;
  awayTeam: Team;
  group: Group | null;
  myPrediction?: PredictionResult | null;
  isLocked?: boolean;
};

export type PickEntry = {
  userId: string;
  name: string | null;
  image: string | null;
  prediction: PredictionResult;
  correct: boolean | null;
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
  accuracy: number;
};

export type SyncResult = {
  synced: number;
  updated: number;
  pointsCalculated: number;
  errors: string[];
};
