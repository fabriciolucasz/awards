import RaffleClient from './RaffleClient';

interface RafflePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RafflePage({ params }: RafflePageProps) {
  const resolvedParams = await params;

  return <RaffleClient slug={resolvedParams.slug} />;
}