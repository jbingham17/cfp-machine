# CFP Machine

A college football playoff prediction web application that allows users to predict game outcomes and see how they affect conference championships and playoff scenarios.

## Features

- 🏈 Browse all FBS college football teams
- 🏆 View conference standings and rankings
- 🎮 Interactive game predictor
- 📊 Calculate playoff scenarios based on predictions
- 🔄 Real-time updates with actual game results
- 💾 Save and share prediction scenarios

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React
- **UI**: Tailwind CSS, shadcn/ui
- **Database**: Convex (real-time, serverless)
- **State Management**: Zustand
- **API**: College Football Data API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- College Football Data API key (get one at [collegefootballdata.com](https://collegefootballdata.com))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cfp-machine.git
cd cfp-machine
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:
```
CFB_API_KEY=your-api-key-here
```

4. Set up Convex:
```bash
npx convex dev
```

This will prompt you to create a new Convex project or link to an existing one.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
cfp-machine/
├── app/                # Next.js app router pages
│   ├── teams/         # Team pages
│   ├── conferences/   # Conference pages
│   └── predictor/     # Playoff predictor
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   ├── teams/        # Team components
│   ├── conferences/  # Conference components
│   └── games/        # Game components
├── convex/           # Backend database
│   ├── schema.ts     # Database schema
│   └── sync.ts       # API sync functions
├── lib/              # Utilities
│   └── cfb-api.ts    # API client
└── store/            # State management
    └── predictions.ts # Prediction store
```

## Data Synchronization

To populate the database with current season data:

1. Make sure Convex is running (`npx convex dev`)
2. Run the sync function from the Convex dashboard or programmatically
3. Data will be fetched from the College Football Data API and stored in Convex

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import your repository in [Vercel](https://vercel.com)

3. Configure environment variables:
   - `CFB_API_KEY`: Your College Football Data API key
   - `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL

4. Deploy!

## Development Roadmap

- [x] Project setup and configuration
- [x] Database schema design
- [x] Core UI components
- [x] Basic pages (teams, conferences)
- [x] Game prediction interface
- [ ] API data synchronization
- [ ] Conference championship logic
- [ ] Complex tiebreaker rules
- [ ] Playoff bracket visualization
- [ ] User accounts and saved scenarios
- [ ] Share predictions feature
- [ ] Historical data analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Acknowledgments

- Data provided by [College Football Data API](https://collegefootballdata.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Built with [Next.js](https://nextjs.org) and [Convex](https://convex.dev)