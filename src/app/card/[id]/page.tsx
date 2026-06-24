import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
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
        title: 'Card Not Found | BallKnowledge',
        description: 'Check out the world cup viral cards on BallKnowledge.'
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
  let errorMsg = null;

  try {
    card = await prisma.matchCard.findUnique({
      where: { id },
      include: { profile: true }
    });
  } catch (dbError) {
    console.error('Database connection error in SharedCardPage server side:', dbError);
    errorMsg = 'Database connection error occurred. Could not load shared card.';
  }

  if (!card && !errorMsg) {
    errorMsg = 'Card not found in the database. Ensure database connection is online and the card has been synced.';
  }

  if (errorMsg || !card) {
    return (
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center p-6 text-center pt-[76px]">
        <div className="max-w-md bg-[#0B0F19]/80 border border-white/10 p-8 rounded-3xl shadow-xl backdrop-blur-md">
          <ShieldAlert className="w-12 h-12 text-[#E11D48] mb-4 mx-auto" />
          <h2 className="font-display font-black text-xl text-white uppercase mb-2">Card Unavailable</h2>
          <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">{errorMsg}</p>
          <Link
            href="/world-cup-hub"
            className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-[#881337] to-[#E11D48] text-white font-display font-black text-xs uppercase tracking-widest shadow-md hover:opacity-90 transition-all hover:scale-102"
          >
            Start Your Own Campaign
          </Link>
        </div>
      </div>
    );
  }

  const clientProfile = {
    username: card.profile.username,
    avatarStyle: card.profile.avatarStyle,
    avatarSeed: card.profile.avatarSeed,
    favoriteClub: card.profile.favoriteClub,
    favoriteNation: card.profile.favoriteNation
  };

  const clientCard = {
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
  };

  return <CardDetailClient initialCard={clientCard} profile={clientProfile} />;
}
