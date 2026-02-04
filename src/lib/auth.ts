// Authentication configuration using NextAuth.js v5 (Auth.js)
// Supports: Email magic links, Google OAuth, GitHub OAuth

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Email magic links (passwordless)
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'Swarm Accelerator <auth@swarm.accelerator.ai>',
    }),
    
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Auto-link if email matches
    }),
    
    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  
  callbacks: {
    async session({ session, user }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = user.id;
        
        // Add subscription tier (for rate limiting)
        const userWithTier = await prisma.user.findUnique({
          where: { id: user.id },
          select: { tier: true, apiKey: true },
        });
        
        session.user.tier = userWithTier?.tier || 'free';
        session.user.apiKey = userWithTier?.apiKey || null;
      }
      
      return session;
    },
    
    async signIn({ user, account, profile }) {
      // Auto-create API key on first sign-in
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (!existingUser?.apiKey) {
          // Generate API key
          const apiKey = generateApiKey('free');
          
          await prisma.user.update({
            where: { email: user.email },
            data: { apiKey },
          });
        }
      }
      
      return true;
    },
  },
  
  session: {
    strategy: 'database', // Use database sessions (more secure)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  debug: process.env.NODE_ENV === 'development',
});

// Generate API key
function generateApiKey(tier: 'free' | 'agent' | 'enterprise'): string {
  const prefix = tier === 'free' ? 'sk_free_' : 
                 tier === 'agent' ? 'sk_agent_' : 
                 'sk_enterprise_';
  
  const randomPart = Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');
  
  return prefix + randomPart;
}

// Middleware helper to protect routes
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Unauthorized - please sign in');
  }
  
  return session;
}

// Check if user has required tier
export async function requireTier(minTier: 'free' | 'startup' | 'enterprise') {
  const session = await requireAuth();
  
  const tierLevel = {
    free: 0,
    startup: 1,
    enterprise: 2,
  };
  
  const userTierLevel = tierLevel[session.user.tier as keyof typeof tierLevel] || 0;
  const requiredTierLevel = tierLevel[minTier];
  
  if (userTierLevel < requiredTierLevel) {
    throw new Error(`This feature requires ${minTier} tier or higher`);
  }
  
  return session;
}
