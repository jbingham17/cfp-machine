"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePredictionStore } from "@/store/predictions";

interface GamePredictorProps {
  game: {
    gameId: number;
    homeTeam: string;
    awayTeam: string;
    homeTeamScore?: number;
    awayTeamScore?: number;
    completed: boolean;
    startDate: string;
    week: number;
  };
}

export function GamePredictor({ game }: GamePredictorProps) {
  const { setPrediction, getPrediction, removePrediction } = usePredictionStore();
  const existingPrediction = getPrediction(game.gameId);
  const [selectedWinner, setSelectedWinner] = useState<'home' | 'away' | null>(
    existingPrediction?.predictedWinner || null
  );

  const handlePrediction = (winner: 'home' | 'away') => {
    if (selectedWinner === winner) {
      removePrediction(game.gameId);
      setSelectedWinner(null);
    } else {
      setPrediction(game.gameId, winner);
      setSelectedWinner(winner);
    }
  };

  const gameDate = new Date(game.startDate);
  const isUpcoming = !game.completed && gameDate > new Date();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Week {game.week}</CardTitle>
          <Badge variant={game.completed ? "secondary" : "default"}>
            {game.completed ? "Final" : isUpcoming ? "Upcoming" : "In Progress"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {gameDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 items-center">
            <Button
              variant={selectedWinner === 'away' ? "default" : "outline"}
              onClick={() => !game.completed && handlePrediction('away')}
              disabled={game.completed}
              className="text-left justify-start"
            >
              <div className="text-left">
                <div className="font-medium">{game.awayTeam}</div>
                {game.completed && game.awayTeamScore !== undefined && (
                  <div className="text-2xl font-bold">{game.awayTeamScore}</div>
                )}
              </div>
            </Button>
            
            <div className="text-center text-muted-foreground">
              {game.completed ? "vs" : "@"}
            </div>
            
            <Button
              variant={selectedWinner === 'home' ? "default" : "outline"}
              onClick={() => !game.completed && handlePrediction('home')}
              disabled={game.completed}
              className="text-left justify-start"
            >
              <div className="text-left">
                <div className="font-medium">{game.homeTeam}</div>
                {game.completed && game.homeTeamScore !== undefined && (
                  <div className="text-2xl font-bold">{game.homeTeamScore}</div>
                )}
              </div>
            </Button>
          </div>
          
          {!game.completed && selectedWinner && (
            <div className="text-center text-sm text-muted-foreground">
              Your pick: {selectedWinner === 'home' ? game.homeTeam : game.awayTeam}
            </div>
          )}
          
          {game.completed && game.homeTeamScore !== undefined && game.awayTeamScore !== undefined && (
            <div className="text-center">
              <Badge variant="outline">
                {game.homeTeamScore > game.awayTeamScore ? game.homeTeam : game.awayTeam} wins
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}