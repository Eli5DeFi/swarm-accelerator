/**
 * POST /api/ags/apply
 * Founder applies for an AI-generated startup idea
 * 
 * Auth: Public (rate limited)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const applicationSchema = z.object({
  ideaId: z.string().cuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  linkedIn: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  twitter: z.string().max(100).optional().nullable(),
  bio: z.string().min(50).max(2000), // Why are you the right founder?
  experience: z.string().min(100).max(5000), // Relevant background
  commitment: z.enum(['Full-time', 'Part-time', 'Nights & Weekends'])
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = applicationSchema.parse(body);

    // Check if idea exists and is available
    const idea = await prisma.generatedIdea.findUnique({
      where: { id: validated.ideaId },
      select: {
        id: true,
        name: true,
        status: true,
        selectedFounderId: true
      }
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Only allow applications for PUBLISHED ideas
    if (idea.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'This idea is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check for duplicate application (same email + ideaId)
    const existingApplication = await prisma.founderApplication.findFirst({
      where: {
        ideaId: validated.ideaId,
        email: validated.email
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this idea' },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.founderApplication.create({
      data: {
        ideaId: validated.ideaId,
        name: validated.name,
        email: validated.email,
        linkedIn: validated.linkedIn,
        github: validated.github,
        twitter: validated.twitter,
        bio: validated.bio,
        experience: validated.experience,
        commitment: validated.commitment,
        status: 'PENDING'
      }
    });

    console.log(`✅ New AGS application: ${validated.name} → ${idea.name}`);

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: "Application submitted! We'll review and contact you within 48 hours."
    }, { status: 201 });

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('AGS application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
