import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const conferences = [
  { id: "acc", name: "ACC", abbreviation: "ACC" },
  { id: "b12", name: "Big 12", abbreviation: "B12" },
  { id: "b1g", name: "Big Ten", abbreviation: "B1G" },
  { id: "sec", name: "SEC", abbreviation: "SEC" },
  { id: "pac12", name: "Pac-12", abbreviation: "PAC" },
  { id: "aac", name: "American", abbreviation: "AAC" },
  { id: "mwc", name: "Mountain West", abbreviation: "MWC" },
  { id: "mac", name: "MAC", abbreviation: "MAC" },
  { id: "sbc", name: "Sun Belt", abbreviation: "SBC" },
  { id: "cusa", name: "Conference USA", abbreviation: "CUSA" },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">CFP Machine</h1>
        <p className="text-muted-foreground">
          Predict conference championships and playoff scenarios for college football
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/predictor">
                <Button>Playoff Predictor</Button>
              </Link>
              <Link href="/teams">
                <Button variant="outline">All Teams</Button>
              </Link>
              <Button variant="outline" disabled>
                Current Rankings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Conferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {conferences.map((conf) => (
            <Link key={conf.id} href={`/conferences/${conf.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{conf.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {conf.abbreviation}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View standings and teams
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}