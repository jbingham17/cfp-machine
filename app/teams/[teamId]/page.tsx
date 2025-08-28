"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GamePredictor } from "@/components/games/game-predictor";
import Link from "next/link";

const mockTeamData = {
  "1": {
    school: "Alabama",
    mascot: "Crimson Tide",
    abbreviation: "ALA",
    conference: "SEC",
    color: "9E1B32",
    altColor: "FFFFFF",
    logo: "https://a.espncdn.com/i/teamlogos/ncaa/500/333.png",
    record: {
      wins: 10,
      losses: 2,
      conferenceWins: 7,
      conferenceLosses: 1,
    },
    games: [
      {
        gameId: 1,
        homeTeam: "Alabama",
        awayTeam: "Middle Tennessee",
        homeTeamScore: 56,
        awayTeamScore: 7,
        completed: true,
        startDate: "2024-09-02T00:00:00Z",
        week: 1,
      },
      {
        gameId: 2,
        homeTeam: "Texas",
        awayTeam: "Alabama",
        homeTeamScore: 34,
        awayTeamScore: 24,
        completed: true,
        startDate: "2024-09-09T00:00:00Z",
        week: 2,
      },
      {
        gameId: 3,
        homeTeam: "Alabama",
        awayTeam: "Georgia",
        completed: false,
        startDate: "2024-09-28T15:30:00Z",
        week: 5,
      },
    ],
  },
};

export default function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const team = mockTeamData[teamId as keyof typeof mockTeamData];

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Team not found</p>
            <div className="flex justify-center mt-4">
              <Link href="/teams">
                <Button variant="outline">Back to Teams</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryColor = `#${team.color}`;
  const altColor = `#${team.altColor}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/teams">
        <Button variant="ghost" className="mb-4">← Back to Teams</Button>
      </Link>

      <div 
        className="mb-8 p-6 rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}20, ${altColor}10)`,
        }}
      >
        <div className="flex items-center gap-4">
          {team.logo && (
            <img 
              src={team.logo} 
              alt={`${team.school} logo`}
              className="w-20 h-20 object-contain"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold">{team.school}</h1>
            <p className="text-xl text-muted-foreground">{team.mascot}</p>
            <div className="flex gap-2 mt-2">
              <Badge>{team.conference}</Badge>
              <Badge variant="outline">{team.abbreviation}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Season Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Overall:</span>
                  <span className="text-2xl font-bold">
                    {team.record.wins}-{team.record.losses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Conference:</span>
                  <span className="text-xl">
                    {team.record.conferenceWins}-{team.record.conferenceLosses}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Win Percentage:</span>
                    <span>
                      {((team.record.wins / (team.record.wins + team.record.losses)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.games.map((game) => (
                  <GamePredictor key={game.gameId} game={game} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}