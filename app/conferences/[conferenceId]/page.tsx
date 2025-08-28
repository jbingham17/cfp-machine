"use client";

import { use } from "react";
import { ConferenceStandings } from "@/components/conferences/conference-standings";
import { TeamCard } from "@/components/teams/team-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockConferences: Record<string, { name: string; teams: any[] }> = {
  sec: {
    name: "Southeastern Conference",
    teams: [
      {
        schoolId: "1",
        school: "Alabama",
        abbreviation: "ALA",
        wins: 10,
        losses: 2,
        conferenceWins: 7,
        conferenceLosses: 1,
        winPercentage: 0.833,
      },
      {
        schoolId: "2",
        school: "Georgia",
        abbreviation: "UGA",
        wins: 11,
        losses: 1,
        conferenceWins: 8,
        conferenceLosses: 0,
        winPercentage: 0.917,
      },
    ],
  },
  b1g: {
    name: "Big Ten Conference",
    teams: [
      {
        schoolId: "3",
        school: "Ohio State",
        abbreviation: "OSU",
        wins: 11,
        losses: 1,
        conferenceWins: 8,
        conferenceLosses: 0,
        winPercentage: 0.917,
      },
      {
        schoolId: "4",
        school: "Michigan",
        abbreviation: "MICH",
        wins: 10,
        losses: 2,
        conferenceWins: 7,
        conferenceLosses: 1,
        winPercentage: 0.833,
      },
    ],
  },
};

export default function ConferencePage({
  params,
}: {
  params: Promise<{ conferenceId: string }>;
}) {
  const { conferenceId } = use(params);
  const conference = mockConferences[conferenceId];

  if (!conference) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Conference not found</p>
            <div className="flex justify-center mt-4">
              <Link href="/conferences">
                <Button variant="outline">Back to Conferences</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">← Back to Home</Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">{conference.name}</h1>
        <p className="text-muted-foreground">Conference standings and team information</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <ConferenceStandings
              teams={conference.teams}
              conferenceName={conference.name}
            />
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Championship Scenarios</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Select game winners to see how it affects the conference championship race
              </p>
              <div className="mt-4">
                <Link href="/predictor">
                  <Button>Go to Predictor</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">All Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {conference.teams.map((team) => (
              <Link key={team.schoolId} href={`/teams/${team.schoolId}`}>
                <TeamCard
                  team={{
                    school: team.school,
                    abbreviation: team.abbreviation,
                    record: {
                      wins: team.wins,
                      losses: team.losses,
                      conferenceWins: team.conferenceWins,
                      conferenceLosses: team.conferenceLosses,
                    },
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}