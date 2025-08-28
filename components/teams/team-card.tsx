"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamCardProps {
  team: {
    school: string;
    mascot?: string;
    abbreviation?: string;
    color?: string;
    altColor?: string;
    logos?: string[];
    record?: {
      wins: number;
      losses: number;
      conferenceWins: number;
      conferenceLosses: number;
    };
  };
}

export function TeamCard({ team }: TeamCardProps) {
  const primaryColor = team.color ? `#${team.color}` : "#000000";
  const altColor = team.altColor ? `#${team.altColor}` : "#ffffff";

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader 
        className="pb-3"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}20, ${altColor}10)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {team.logos && team.logos[0] && (
              <img 
                src={team.logos[0]} 
                alt={`${team.school} logo`}
                className="w-12 h-12 object-contain"
              />
            )}
            <div>
              <CardTitle className="text-lg">{team.school}</CardTitle>
              {team.mascot && (
                <p className="text-sm text-muted-foreground">{team.mascot}</p>
              )}
            </div>
          </div>
          {team.abbreviation && (
            <Badge variant="outline">{team.abbreviation}</Badge>
          )}
        </div>
      </CardHeader>
      {team.record && (
        <CardContent>
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">Overall:</span>{" "}
              <span>{team.record.wins}-{team.record.losses}</span>
            </div>
            <div>
              <span className="font-medium">Conference:</span>{" "}
              <span>{team.record.conferenceWins}-{team.record.conferenceLosses}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}