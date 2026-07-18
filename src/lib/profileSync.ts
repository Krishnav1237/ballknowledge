/**
 * @file profileSync.ts
 * @description Client-side synchronization helper for managing the user profile and prediction history.
 * Implements a database-authoritative pattern: reads and updates are held in memory (client cache)
 * and synced with the PostgreSQL database. No localStorage is used.
 */

export interface FootballIQProfile {
  id?: string;
  username: string;
  email?: string | null;
  name?: string | null;
  avatarStyle: string;
  avatarSeed: string;
  favoriteClub?: string;
  favoriteNation?: string;
  overallRating: number;     // OVR — Final Football IQ Rating
  predictionRating: number;  // PRD — Predictor Score (0-100)
  hotTakeRating: number;     // HOT — Hot Take Score (0-100)
  managerRating: number;     // MGR — Manager Score (0-99)
  roastScore: number;        // RST — Roast Score (50-100)
  role: 'FREE' | 'PREMIUM' | 'ADMIN';
  season: string;
  collectedCards: string[];  // List of MatchCard IDs earned
  isAuthenticated?: boolean;
  authProvider?: 'google' | 'facebook' | 'discord' | null;
  xp?: number;
  points?: number;
  inputImage?: string | null; // Saved original uploaded photo base64
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
  managerRating: 50,
  roastScore: 50,
  role: 'FREE',
  season: 'World Cup 2026 Season',
  collectedCards: [],
  isAuthenticated: false,
  authProvider: null,
  xp: 1200,
  points: 150,
  inputImage: null
};

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
  card?: any;                  // Custom graded collectible match card (VerdictCard)
  lineup?: Record<string, any>; // Chosen Best XI lineup (maps position ID to player data)
  gradedTakes?: any[];         // Array containing individual hot take grades
}

// In-memory client-side cache
let inMemoryProfile: FootballIQProfile | null = null;
let inMemoryPredictions: Record<string, LocalPrediction> = {};
let isLoaded = false;
let authLoadPromise: Promise<void> | null = null;

// Trigger loading of session profile on browser initialization
if (typeof window !== 'undefined') {
  loadSessionProfile();
}

export async function loadSessionProfile() {
  if (isLoaded) return;
  if (authLoadPromise) return authLoadPromise;

  authLoadPromise = (async () => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.profile) {
          inMemoryProfile = {
            ...DEFAULT_PROFILE,
            ...data.profile,
            isAuthenticated: true
          };

          // Map database predictions
          const preds: Record<string, LocalPrediction> = {};
          if (data.predictions) {
            data.predictions.forEach((p: any) => {
              const matchCard = p.card || (data.profile.matchCards?.find((c: any) => c.matchId === p.matchId));
              preds[p.matchId] = {
                matchId: p.matchId,
                homeScore: p.homeScore,
                awayScore: p.awayScore,
                firstGoalscorer: p.firstGoalscorer,
                motm: p.motm,
                possessionWinner: p.possessionWinner,
                hotTakes: p.hotTakes?.map((ht: any) => ({
                  statement: ht.statement,
                  confidence: ht.confidence
                })) || [],
                locked: true,
                resolved: !!matchCard,
                card: matchCard || null,
                lineup: p.lineup || null
              };
            });
          }
          inMemoryPredictions = preds;

          try {
            localStorage.setItem('football_iq_profile', JSON.stringify(inMemoryProfile));
          } catch (e) {
            console.warn('Failed to write profile to localStorage:', e);
          }

          // Dispatch 'storage' event so all listening pages update their profile state
          window.dispatchEvent(new Event('storage'));
        } else {
          inMemoryProfile = null;
          inMemoryPredictions = {};
        }
      }
    } catch (err) {
      console.error('Failed to load session profile:', err);
    } finally {
      isLoaded = true;
      authLoadPromise = null;
    }
  })();

  return authLoadPromise;
}

/**
 * Retrieves the user profile from in-memory cache.
 */
export function getStoredProfile(): FootballIQProfile {
  return inMemoryProfile || DEFAULT_PROFILE;
}

/**
 * Writes the profile to in-memory cache.
 */
export function saveStoredProfile(profile: FootballIQProfile) {
  inMemoryProfile = profile;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('football_iq_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to write profile to localStorage:', e);
    }
    window.dispatchEvent(new Event('storage'));
  }
}

export function clearStoredProfile() {
  inMemoryProfile = null;
  inMemoryPredictions = {};
  isLoaded = false;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('football_iq_profile');
    } catch (e) {
      console.warn('Failed to remove profile from localStorage:', e);
    }
    window.dispatchEvent(new Event('storage'));
  }
}

export function clearStoredPredictionsForCurrentProfile() {
  inMemoryPredictions = {};
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
}

/**
 * Retrieves the prediction map from in-memory cache.
 */
export function getStoredPredictions(): Record<string, LocalPrediction> {
  return inMemoryPredictions;
}

/**
 * Persists the prediction map to in-memory cache.
 */
export function saveStoredPredictions(preds: Record<string, LocalPrediction>) {
  inMemoryPredictions = preds;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
}

/**
 * Synchronizes the local profile with the server.
 */
export async function syncProfileWithDb(profile: FootballIQProfile): Promise<FootballIQProfile> {
  if (typeof window === 'undefined') return profile;
  try {
    const res = await fetch(`/api/profile/${encodeURIComponent(profile.username)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
          managerRating: data.profile.managerRating,
          roastScore: data.profile.roastScore,
          role: data.profile.role,
          avatarStyle: data.profile.avatarStyle,
          avatarSeed: data.profile.avatarSeed,
          email: data.profile.email || profile.email,
          name: data.profile.name || profile.name,
          inputImage: data.profile.inputImage || profile.inputImage,
          favoriteClub: data.profile.favoriteClub || profile.favoriteClub,
          favoriteNation: data.profile.favoriteNation || profile.favoriteNation,
          collectedCards: data.cards ? data.cards.map((c: any) => c.id) : profile.collectedCards
        };
        
        // Sync database predictions map back to in-memory predictions
        if (data.predictions) {
          const preds: Record<string, LocalPrediction> = { ...inMemoryPredictions };
          data.predictions.forEach((p: any) => {
            const matchCard = data.cards?.find((c: any) => c.matchId === p.matchId);
            preds[p.matchId] = {
              ...(inMemoryPredictions[p.matchId] || {}),
              matchId: p.matchId,
              homeScore: p.homeScore,
              awayScore: p.awayScore,
              firstGoalscorer: p.firstGoalscorer,
              motm: p.motm,
              possessionWinner: p.possessionWinner,
              hotTakes: p.hotTakes?.map((ht: any) => ({
                statement: ht.statement,
                confidence: ht.confidence
              })) || [],
              locked: true,
              resolved: !!matchCard,
              card: matchCard || null,
              lineup: p.lineup || (inMemoryPredictions[p.matchId]?.lineup) || null
            };
          });
          inMemoryPredictions = preds;
        }

        saveStoredProfile(synced);
        window.dispatchEvent(new Event('storage'));
        return synced;
      }
    }
  } catch (err) {
    console.warn('Db sync offline, continuing with local cache:', err);
  }
  return profile;
}

/**
 * Deletes the profile from the database.
 */
export async function wipeProfileFromDb(username: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch(`/api/profile/${encodeURIComponent(username)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete profile from database (offline/network error):', err);
    return false;
  }
}

/**
 * Centrally resolves a clean, premium avatar URL supporting both custom face uploads (Google/Discord, data:image URLs)
 * and Dicebear custom-seeded avatars.
 */
export function getAvatarUrl(avatarStyle: string, avatarSeed: string): string {
  const seed = avatarSeed || 'Reputation';
  const style = avatarStyle || 'fun-emoji';
  if (seed.startsWith('data:image/') || seed.startsWith('http') || seed.startsWith('/images') || seed.startsWith('/')) {
    return seed;
  }
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
