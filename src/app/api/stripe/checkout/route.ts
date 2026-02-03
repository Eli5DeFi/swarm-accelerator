import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";

const CheckoutSchema = z.object({
  priceId: z.string(),
  customerEmail: z.string().email().optional(),
  tier: z.enum(["starter", "growth"]),
  billingPeriod: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, customerEmail, tier, billingPeriod } = CheckoutSchema.parse(body);
    
    const origin = request.headers.get("origin") || "http://localhost:3000";
    
    const session = await createCheckoutSession({
      priceId,
      customerEmail,
      successUrl: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancelUrl: `${origin}/pricing?canceled=true`,
      metadata: {
        tier,
        billingPeriod,
      },
    });
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
    
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}
