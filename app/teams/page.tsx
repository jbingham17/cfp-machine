"use client";

import { useState } from "react";
import { TeamCard } from "@/components/teams/team-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockTeams = [
  {
    schoolId: "1",
    school: "Alabama",
    mascot: "Crimson Tide",
    abbreviation: "ALA",
    color: "9E1B32",
    altColor: "FFFFFF",
    logos: ["https://a.espncdn.com/i/teamlogos/ncaa/500/333.png"],
    conferenceId: "sec",
  },
  {
    schoolId: "2",
    school: "Georgia",
    mascot: "Bulldogs",
    abbreviation: "UGA",
    color: "BA0C2F",
    altColor: "000000",
    logos: ["https://a.espncdn.com/i/teamlogos/ncaa/500/61.png"],
    conferenceId: "sec",
  },
  {
    schoolId: "3",
    school: "Ohio State",
    mascot: "Buckeyes",
    abbreviation: "OSU",
    color: "BB0000",
    altColor: "666666",
    logos: ["https://a.espncdn.com/i/teamlogos/ncaa/500/194.png"],
    conferenceId: "b1g",
  },
];

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConference, setSelectedConference] = useState<string>("all");

  const filteredTeams = mockTeams.filter((team) => {
    const matchesSearch = team.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.mascot?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConference = selectedConference === "all" || team.conferenceId === selectedConference;
    return matchesSearch && matchesConference;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">All Teams</h1>
        <p className="text-muted-foreground">Browse all FBS college football teams</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedConference} onValueChange={setSelectedConference}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by conference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conferences</SelectItem>
            <SelectItem value="sec">SEC</SelectItem>
            <SelectItem value="b1g">Big Ten</SelectItem>
            <SelectItem value="acc">ACC</SelectItem>
            <SelectItem value="b12">Big 12</SelectItem>
            <SelectItem value="pac12">Pac-12</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTeams.map((team) => (
          <TeamCard key={team.schoolId} team={team} />
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No teams found matching your criteria</p>
        </div>
      )}
    </div>
  );
}