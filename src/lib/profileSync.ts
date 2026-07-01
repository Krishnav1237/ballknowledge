/**
 * @file profileSync.ts
 * @description Client-side synchronization helper for managing the user profile and prediction history.
 * Implements an offline-first hybrid pattern: reads and updates are performed instantly via
 * localStorage (`var_cards_profile` and `var_cards_predictions`) and then queued or synced opportunistically
 * with the PostgreSQL database. If database writes fail due to connection issues, the app runs 100% locally.
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

const PROFILE_KEY = 'var_cards_profile';
const LEGACY_PREDICTIONS_KEY = 'var_cards_predictions';

function getPredictionStorageKey(profile?: FootballIQProfile | null) {
  const profileRef = profile?.id || profile?.username;
  if (!profileRef || profileRef === DEFAULT_PROFILE.username) return LEGACY_PREDICTIONS_KEY;
  return `var_cards_predictions_${encodeURIComponent(profileRef)}`;
}

function getCurrentProfileForStorage(): FootballIQProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the user profile from local storage.
 * Performs migrations for older V0 storage keys (`tacticalRating` and `communityRating`)
 * to maintain backward compatibility for existing users.
 * 
 * @returns {FootballIQProfile} The stored user profile, or DEFAULT_PROFILE if empty or parsing fails.
 */
export function getStoredProfile(): FootballIQProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migration pattern: map V0 fields to V1
      if (parsed.tacticalRating !== undefined && parsed.managerRating === undefined) {
        parsed.managerRating = parsed.tacticalRating;
        delete parsed.tacticalRating;
      }
      if (parsed.communityRating !== undefined && parsed.roastScore === undefined) {
        parsed.roastScore = parsed.communityRating;
        delete parsed.communityRating;
      }
      // Ensure defaults for any missing fields
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
      };
    }
  } catch (e) {
    console.warn('Failed to parse localStorage profile:', e);
  }
  
  // Set default if not exists
  saveStoredProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

/**
 * Writes the profile to local storage.
 * 
 * @param {FootballIQProfile} profile - The user profile object to write.
 */
export function saveStoredProfile(profile: FootballIQProfile) {
  if (typeof window === 'undefined') return;
  try {
    if (profile.isAuthenticated && (profile.id || profile.username)) {
      const profilePredKey = getPredictionStorageKey(profile);
      const legacyPreds = localStorage.getItem(LEGACY_PREDICTIONS_KEY);
      if (legacyPreds && !localStorage.getItem(profilePredKey)) {
        localStorage.setItem(profilePredKey, legacyPreds);
      }
      localStorage.removeItem(LEGACY_PREDICTIONS_KEY);
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage:', e);
  }
}

export function clearStoredProfile() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(LEGACY_PREDICTIONS_KEY);
}

export function clearStoredPredictionsForCurrentProfile() {
  if (typeof window === 'undefined') return;
  const profile = getCurrentProfileForStorage();
  localStorage.removeItem(getPredictionStorageKey(profile));
  localStorage.removeItem(LEGACY_PREDICTIONS_KEY);
}

/**
 * Synchronizes the local profile with the server.
 * Invokes the `/api/resolve-match` endpoint with a `syncOnly: true` flag to upsert
 * the profile info without initiating any match resolution or AI grading logic.
 * 
 * @param {FootballIQProfile} profile - The local profile to sync.
 * @returns {Promise<FootballIQProfile>} The synchronized profile with database IDs or updated fields, or the original profile on network/DB failure.
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
        
        // Sync database predictions map back to local storage predictions to avoid data overlap
        if (data.predictions) {
          const storageKey = getPredictionStorageKey(synced);
          let existingPreds: Record<string, any> = {};
          try {
            existingPreds = JSON.parse(localStorage.getItem(storageKey) || '{}');
          } catch {
            existingPreds = {};
          }
          const localPreds: Record<string, any> = { ...existingPreds };
          data.predictions.forEach((p: any) => {
            const matchCard = data.cards?.find((c: any) => c.matchId === p.matchId);
            localPreds[p.matchId] = {
              ...(existingPreds[p.matchId] || {}),
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
              lineup: p.lineup || (existingPreds[p.matchId]?.lineup) || null
            };
          });
          
          localStorage.setItem(storageKey, JSON.stringify(localPreds));
        }

        saveStoredProfile(synced);
        window.dispatchEvent(new Event('storage'));
        return synced;
      }
    }
  } catch (err) {
    console.warn('Db sync offline, continuing with local storage:', err);
  }
  return profile;
}

/**
 * Deletes the profile from the database.
 * Used during campaign wipes for authenticated users.
 * 
 * @param {string} username - The username profile to delete.
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
}

/**
 * Retrieves the prediction map from local storage.
 * 
 * @returns {Record<string, LocalPrediction>} Map of matchId -> prediction data.
 */
export function getStoredPredictions(): Record<string, LocalPrediction> {
  if (typeof window === 'undefined') return {};
  try {
    const profile = getCurrentProfileForStorage();
    const raw = localStorage.getItem(getPredictionStorageKey(profile));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse predictions:', e);
  }
  return {};
}

/**
 * Persists the prediction map to local storage.
 * 
 * @param {Record<string, LocalPrediction>} preds - The map of match predictions.
 */
export function saveStoredPredictions(preds: Record<string, LocalPrediction>) {
  if (typeof window === 'undefined') return;
  try {
    const profile = getCurrentProfileForStorage();
    localStorage.setItem(getPredictionStorageKey(profile), JSON.stringify(preds));
  } catch (e) {
    console.error('Failed to save predictions:', e);
  }
}
