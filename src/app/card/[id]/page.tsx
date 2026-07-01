import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { fetchWorldCupMatches, fetchWorldCupTeams } from '@/lib/worldcupData';
import CardDetailClient from './CardDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function resolveMatchDetails(matchId: string) {
  try {
    const [matches, teams] = await Promise.all([
      fetchWorldCupMatches(),
      fetchWorldCupTeams()
    ]);
    const match = matches.find(m => String(m.id) === String(matchId));
    if (!match) return {};

    const homeTeam = teams.find(t => String(t.id) === String(match.home_team_id)) || { name_en: match.home_team_label || 'Home', flag: '', fifa_code: '' };
    const awayTeam = teams.find(t => String(t.id) === String(match.away_team_id)) || { name_en: match.away_team_label || 'Away', flag: '', fifa_code: '' };

    return {
      matchTitle: `${homeTeam.name_en} vs ${awayTeam.name_en}`,
      matchScore: match.home_score !== '' && match.home_score !== undefined ? `${match.home_score} - ${match.away_score}` : undefined,
      homeFlag: homeTeam.flag,
      awayFlag: awayTeam.flag,
      homeFifaCode: (homeTeam as any).fifa_code || homeTeam.name_en?.slice(0, 3).toUpperCase() || 'HOM',
      awayFifaCode: (awayTeam as any).fifa_code || awayTeam.name_en?.slice(0, 3).toUpperCase() || 'AWY',
    };
  } catch (err) {
    console.error('Failed to resolve match details for card share view:', err);
    return {};
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const card = await prisma.matchCard.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!card) {
      return {
        title: 'VAR Verdict Card | BallKnowledge',
        description: 'Check out this Football IQ card on BallKnowledge!'
      };
    }

    const matchDetails = await resolveMatchDetails(card.matchId);
    const fixtureString = matchDetails.homeFifaCode && matchDetails.awayFifaCode
      ? ` [${matchDetails.homeFifaCode} vs ${matchDetails.awayFifaCode}]`
      : '';

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.vercel.app';
    const title = `${card.profile.username || 'Manager'}'s VAR Verdict${fixtureString} — OVR ${card.rating || 50}`;
    const description = `Verdict: ${card.verdict || 'VAR VERDICT'} | ${card.charge || 'Football IQ audited.'}. Check out this Football IQ card!`;
    const ogParams = new URLSearchParams({
      user: card.profile.username || 'Tactical Manager',
      verdict: card.verdict || 'VAR VERDICT CARD',
      fixture: matchDetails.homeFifaCode && matchDetails.awayFifaCode ? `${matchDetails.homeFifaCode} vs ${matchDetails.awayFifaCode}` : 'World Cup 2026',
      rarity: card.rarity || 'COMMON',
      rating: String(card.rating || 50),
    });
    const imageUrl = `${siteUrl}/api/og/card?${ogParams.toString()}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl, width: 800, height: 1067, alt: `${card.profile.username}'s Card` }],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl]
      }
    };
  } catch {
    return {
      title: 'VAR Verdict Card | BallKnowledge',
      description: 'Check out this Football IQ card on BallKnowledge!'
    };
  }
}

export default async function SharedCardPage({ params }: Props) {
  const { id } = await params;
  let card = null;

  try {
    card = await prisma.matchCard.findUnique({
      where: { id },
      include: { profile: true }
    });
  } catch (dbError) {
    console.error('Database connection error in SharedCardPage server side:', dbError);
  }

  const clientProfile = card?.profile ? {
    id: card.profile.id,
    username: card.profile.username,
    avatarStyle: card.profile.avatarStyle,
    avatarSeed: card.profile.avatarSeed,
    inputImage: card.profile.inputImage,
    favoriteClub: card.profile.favoriteClub,
    favoriteNation: card.profile.favoriteNation,
    overallRating: card.profile.overallRating || 88
  } : {
    username: 'Tactical Manager',
    avatarStyle: 'fun-emoji',
    avatarSeed: 'Manager',
    inputImage: null,
    favoriteClub: 'VAR FC',
    favoriteNation: 'Argentina',
    overallRating: 88
  };

  const matchDetails = card ? await resolveMatchDetails(card.matchId) : {};

  const clientCard = card ? {
    id: card.id,
    matchId: card.matchId,
    rating: card.rating,
    verdict: card.verdict,
    charge: card.charge,
    evidence: card.evidence,
    sentence: card.sentence,
    rarity: card.rarity,
    cardTheme: card.cardTheme,
    aiImageUrl: card.aiImageUrl,
    statsJson: card.statsJson,
    ...matchDetails
  } : {
    id: id,
    matchId: id,
    rating: 88,
    verdict: 'TACTICAL MASTERMIND',
    charge: 'Audited VAR Prediction',
    evidence: 'Hot Take statement: "World Cup 2026 Tactical Brilliance"',
    sentence: 'Certified Ball Knowledge Expert',
    rarity: 'LEGENDARY',
    cardTheme: 'gold',
    aiImageUrl: null,
    statsJson: { prd: 90, mgr: 88, hot: 85, rst: 92 },
    matchTitle: 'Argentina vs France',
    matchScore: '3 - 3',
    homeFlag: 'https://flagcdn.com/w80/ar.png',
    awayFlag: 'https://flagcdn.com/w80/fr.png',
    homeFifaCode: 'ARG',
    awayFifaCode: 'FRA'
  };

  return <CardDetailClient initialCard={clientCard} profile={clientProfile} />;
}
