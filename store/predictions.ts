import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GamePrediction {
  gameId: number;
  predictedWinner: 'home' | 'away';
  homeScore?: number;
  awayScore?: number;
}

interface PredictionStore {
  predictions: Map<number, GamePrediction>;
  setPrediction: (gameId: number, winner: 'home' | 'away', homeScore?: number, awayScore?: number) => void;
  removePrediction: (gameId: number) => void;
  clearPredictions: () => void;
  getPrediction: (gameId: number) => GamePrediction | undefined;
}

export const usePredictionStore = create<PredictionStore>()(
  persist(
    (set, get) => ({
      predictions: new Map(),
      
      setPrediction: (gameId, winner, homeScore, awayScore) => {
        set((state) => {
          const newPredictions = new Map(state.predictions);
          newPredictions.set(gameId, {
            gameId,
            predictedWinner: winner,
            homeScore,
            awayScore,
          });
          return { predictions: newPredictions };
        });
      },
      
      removePrediction: (gameId) => {
        set((state) => {
          const newPredictions = new Map(state.predictions);
          newPredictions.delete(gameId);
          return { predictions: newPredictions };
        });
      },
      
      clearPredictions: () => {
        set({ predictions: new Map() });
      },
      
      getPrediction: (gameId) => {
        return get().predictions.get(gameId);
      },
    }),
    {
      name: 'cfp-predictions',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              predictions: new Map(state.predictions),
            },
          };
        },
        setItem: (name, value) => {
          const { state } = value as any;
          const serialized = {
            state: {
              ...state,
              predictions: Array.from(state.predictions.entries()),
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);