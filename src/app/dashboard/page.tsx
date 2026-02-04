import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  // Fetch user's pitches with related data
  const pitches = await prisma.startup.findMany({
    where: {
      userId: (session.user as any).id,
    },
    include: {
      funding: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <DashboardClient 
      user={session.user} 
      pitches={pitches}
    />
  );
}
