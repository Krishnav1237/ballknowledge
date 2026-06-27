import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import CardDetailClient from './CardDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
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

    const title = `${card.profile.username}'s VAR Verdict — OVR ${card.rating}`;
    const description = `Verdict: ${card.verdict} | ${card.charge}. Check out this Football IQ card!`;
    const imageUrl = card.aiImageUrl || 'https://ballknowledge.vercel.app/images/card_bg.webp';

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
    username: card.profile.username,
    avatarStyle: card.profile.avatarStyle,
    avatarSeed: card.profile.avatarSeed,
    favoriteClub: card.profile.favoriteClub,
    favoriteNation: card.profile.favoriteNation,
    overallRating: card.profile.overallRating || 88
  } : {
    username: 'Tactical Manager',
    avatarStyle: 'fun-emoji',
    avatarSeed: 'Manager',
    favoriteClub: 'VAR FC',
    favoriteNation: 'Argentina',
    overallRating: 88
  };

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
    statsJson: card.statsJson
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
    statsJson: { prd: 90, mgr: 88, hot: 85, rst: 92 }
  };

  return <CardDetailClient initialCard={clientCard} profile={clientProfile} />;
}
