import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { analyzeStartup } from "@/lib/agents/orchestrator";

// Validation schema
const CreatePitchSchema = z.object({
  name: z.string().min(1).max(100),
  tagline: z.string().min(1).max(200),
  description: z.string().min(50).max(2000),
  stage: z.enum(["IDEA", "MVP", "GROWTH", "SCALE"]),
  industry: z.string().min(1),
  fundingAsk: z.number().min(10000).max(100000000),
  teamSize: z.number().min(1).max(1000),
  founderName: z.string().min(1),
  founderEmail: z.string().email(),
  website: z.string().url().optional().nullable(),
  deckUrl: z.string().url().optional().nullable(),
  pitchVideo: z.string().url().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreatePitchSchema.parse(body);
    
    // Create startup in database
    const startup = await prisma.startup.create({
      data: {
        ...validatedData,
        status: "PENDING",
      },
    });
    
    // Trigger analysis asynchronously (don't wait for it)
    analyzeStartup(startup.id)
      .then(() => {
        console.log(`Analysis completed for startup: ${startup.id}`);
      })
      .catch((error) => {
        console.error(`Analysis failed for startup: ${startup.id}`, error);
      });
    
    return NextResponse.json(
      {
        success: true,
        startupId: startup.id,
        message: "Pitch submitted successfully. Analysis in progress...",
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    console.error("Error creating pitch:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit pitch",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    const where = status ? { status: status as any } : {};
    
    const [startups, total] = await Promise.all([
      prisma.startup.findMany({
        where,
        include: {
          analysis: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.startup.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: startups,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
    
  } catch (error) {
    console.error("Error fetching pitches:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pitches",
      },
      { status: 500 }
    );
  }
}
