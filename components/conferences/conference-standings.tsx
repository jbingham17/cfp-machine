"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Team {
  schoolId: string;
  school: string;
  abbreviation?: string;
  wins: number;
  losses: number;
  conferenceWins: number;
  conferenceLosses: number;
  winPercentage: number;
}

interface ConferenceStandingsProps {
  teams: Team[];
  conferenceName: string;
}

export function ConferenceStandings({ teams, conferenceName }: ConferenceStandingsProps) {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.conferenceWins !== a.conferenceWins) {
      return b.conferenceWins - a.conferenceWins;
    }
    if (a.conferenceLosses !== b.conferenceLosses) {
      return a.conferenceLosses - b.conferenceLosses;
    }
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return a.school.localeCompare(b.school);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{conferenceName} Standings</h2>
        <Badge variant="outline">2024 Season</Badge>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">Conference</TableHead>
            <TableHead className="text-center">Overall</TableHead>
            <TableHead className="text-center">Win %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTeams.map((team, index) => (
            <TableRow key={team.schoolId} className="hover:bg-muted/50">
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {team.school}
                  {team.abbreviation && (
                    <Badge variant="ghost" className="ml-2">
                      {team.abbreviation}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {team.conferenceWins}-{team.conferenceLosses}
              </TableCell>
              <TableCell className="text-center">
                {team.wins}-{team.losses}
              </TableCell>
              <TableCell className="text-center">
                {(team.winPercentage * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}