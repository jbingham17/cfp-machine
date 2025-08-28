"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GamePredictor } from "@/components/games/game-predictor";
import { ConferenceStandings } from "@/components/conferences/conference-standings";
import { usePredictionStore } from "@/store/predictions";
import { Badge } from "@/components/ui/badge";

const mockGames = [
  {
    gameId: 101,
    homeTeam: "Alabama",
    awayTeam: "Georgia",
    completed: false,
    startDate: "2024-12-07T15:30:00Z",
    week: 14,
  },
  {
    gameId: 102,
    homeTeam: "Ohio State",
    awayTeam: "Michigan",
    completed: false,
    startDate: "2024-11-30T12:00:00Z",
    week: 14,
  },
  {
    gameId: 103,
    homeTeam: "Oregon",
    awayTeam: "Washington",
    completed: false,
    startDate: "2024-11-30T20:00:00Z",
    week: 14,
  },
];

const mockStandings = {
  sec: {
    name: "SEC Championship",
    teams: [
      {
        schoolId: "1",
        school: "Georgia",
        abbreviation: "UGA",
        wins: 11,
        losses: 1,
        conferenceWins: 8,
        conferenceLosses: 0,
        winPercentage: 0.917,
      },
      {
        schoolId: "2",
        school: "Alabama",
        abbreviation: "ALA",
        wins: 10,
        losses: 2,
        conferenceWins: 7,
        conferenceLosses: 1,
        winPercentage: 0.833,
      },
    ],
  },
  b1g: {
    name: "Big Ten Championship",
    teams: [
      {
        schoolId: "3",
        school: "Ohio State",
        abbreviation: "OSU",
        wins: 11,
        losses: 0,
        conferenceWins: 8,
        conferenceLosses: 0,
        winPercentage: 1.0,
      },
      {
        schoolId: "4",
        school: "Michigan",
        abbreviation: "MICH",
        wins: 10,
        losses: 1,
        conferenceWins: 7,
        conferenceLosses: 1,
        winPercentage: 0.909,
      },
    ],
  },
};

export default function PredictorPage() {
  const { predictions, clearPredictions } = usePredictionStore();
  const [activeConference, setActiveConference] = useState<string>("sec");

  const predictionCount = predictions.size;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Playoff Predictor</h1>
        <p className="text-muted-foreground">
          Predict game outcomes to see how they affect conference championships
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Games</CardTitle>
                {predictionCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge>{predictionCount} predictions</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearPredictions}
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGames.map((game) => (
                  <GamePredictor key={game.gameId} game={game} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conference Championships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mockStandings).map(([key, conf]) => (
                  <Button
                    key={key}
                    variant={activeConference === key ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveConference(key)}
                  >
                    {conf.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {activeConference && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {mockStandings[activeConference as keyof typeof mockStandings].name} Race
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockStandings[activeConference as keyof typeof mockStandings].teams.map((team, idx) => (
                    <div key={team.schoolId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{idx + 1}</span>
                        <div>
                          <p className="font-medium">{team.school}</p>
                          <p className="text-sm text-muted-foreground">
                            {team.conferenceWins}-{team.conferenceLosses} conference
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {team.wins}-{team.losses}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Predicted Champions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Based on your predictions, these teams would win their conferences:
              </p>
              <div className="mt-4 space-y-2">
                <Badge variant="secondary" className="block w-full text-center p-2">
                  Feature coming soon
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}