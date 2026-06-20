export interface FootballIQProfile {
  id?: string;
  username: string;
  avatarStyle: string;
  avatarSeed: string;
  favoriteClub?: string;
  favoriteNation?: string;
  overallRating: number;
  predictionRating: number;
  hotTakeRating: number;
  tacticalRating: number;
  communityRating: number;
  role: 'FREE' | 'PREMIUM' | 'ADMIN';
  season: string;
  collectedCards: string[]; // List of MatchCard IDs
  isAuthenticated?: boolean;
  authProvider?: 'google' | 'facebook' | 'discord' | null;
  xp?: number;
  points?: number;
}

const DEFAULT_PROFILE: FootballIQProfile = {
  username: 'Rookie_Tactician',
  avatarStyle: 'fun-emoji',
  avatarSeed: 'Reputation',
  favoriteClub: 'VAR FC',
  favoriteNation: 'Argentina',
  overallRating: 50,
  predictionRating: 50,
  hotTakeRating: 50,
  tacticalRating: 50,
  communityRating: 50,
  role: 'FREE',
  season: 'World Cup 2026 Season',
  collectedCards: [],
  isAuthenticated: false,
  authProvider: null,
  xp: 1200,
  points: 150
};


export function getStoredProfile(): FootballIQProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem('var_cards_profile');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse localStorage profile:', e);
  }
  
  // Set default if not exists
  saveStoredProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: FootballIQProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('var_cards_profile', JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage:', e);
  }
}

// Sync local profile state with PostgreSQL DB if online
export async function syncProfileWithDb(profile: FootballIQProfile): Promise<FootballIQProfile> {
  if (typeof window === 'undefined') return profile;
  try {
    const res = await fetch('/api/resolve-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syncOnly: true,
        profile
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.profile) {
        const synced = {
          ...profile,
          id: data.profile.id,
          username: data.profile.username,
          overallRating: data.profile.overallRating,
          predictionRating: data.profile.predictionRating,
          hotTakeRating: data.profile.hotTakeRating,
          tacticalRating: data.profile.tacticalRating,
          communityRating: data.profile.communityRating,
          role: data.profile.role
        };
        saveStoredProfile(synced);
        return synced;
      }
    }
  } catch (err) {
    console.warn('Db sync offline, continuing with local storage:', err);
  }
  return profile;
}

// Local storage helpers for match predictions
export interface LocalPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  firstGoalscorer: string;
  motm: string;
  possessionWinner: string;
  hotTakes: { statement: string; confidence: number }[];
  locked: boolean;
  resolved: boolean;
  card?: any; // Graded match verdict card
  lineup?: Record<string, any>; // FIFA-style Best XI lineup (position -> player)
}

export function getStoredPredictions(): Record<string, LocalPrediction> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('var_cards_predictions');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse predictions:', e);
  }
  return {};
}

export function saveStoredPredictions(preds: Record<string, LocalPrediction>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('var_cards_predictions', JSON.stringify(preds));
  } catch (e) {
    console.error('Failed to save predictions:', e);
  }
}
