interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}

interface Team {
  id: number;
  school: string;
  mascot?: string;
  abbreviation?: string;
  conference?: string;
  division?: string;
  color?: string;
  alt_color?: string;
  logos?: string[];
}

interface Conference {
  id: number;
  name: string;
  abbreviation?: string;
  classification?: string;
}

interface Game {
  id: number;
  season: number;
  week: number;
  season_type: string;
  start_date: string;
  home_team: string;
  home_id?: number;
  home_points?: number;
  away_team: string;
  away_id?: number;
  away_points?: number;
  conference_game?: boolean;
}

interface TeamRecord {
  year: number;
  team: string;
  conference?: string;
  division?: string;
  total: {
    games: number;
    wins: number;
    losses: number;
  };
  conferenceGames?: {
    games: number;
    wins: number;
    losses: number;
  };
}

class CFBApiClient {
  private config: ApiConfig;

  constructor(apiKey?: string) {
    this.config = {
      baseUrl: "https://apinext.collegefootballdata.com",
      apiKey,
    };
  }

  private async fetchApi<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: HeadersInit = {
      "Accept": "application/json",
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTeams(params?: {
    conference?: string;
    division?: string;
  }): Promise<Team[]> {
    return this.fetchApi<Team[]>("/teams", params);
  }

  async getFBSTeams(): Promise<Team[]> {
    return this.fetchApi<Team[]>("/teams/fbs");
  }

  async getConferences(): Promise<Conference[]> {
    return this.fetchApi<Conference[]>("/conferences");
  }

  async getGames(params: {
    year: number;
    week?: number;
    seasonType?: string;
    team?: string;
    conference?: string;
    division?: string;
  }): Promise<Game[]> {
    return this.fetchApi<Game[]>("/games", params);
  }

  async getTeamRecords(params: {
    year: number;
    team?: string;
    conference?: string;
  }): Promise<TeamRecord[]> {
    return this.fetchApi<TeamRecord[]>("/records", params);
  }

  async getGamesByWeek(season: number, week: number): Promise<Game[]> {
    return this.fetchApi<Game[]>("/games", {
      year: season,
      week,
      division: "fbs",
    });
  }

  async getConferenceStandings(params: {
    year: number;
    conference?: string;
  }): Promise<any> {
    return this.fetchApi("/standings", params);
  }
}

export default CFBApiClient;
export type { Team, Conference, Game, TeamRecord };