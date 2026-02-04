import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not set");
    }
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    
    console.log(`Received webhook: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }
      
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }
      
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout completed:", session.id);
  
  // TODO: Create or update user account with subscription info
  // For now, just log it
  // In production, you'd create a User model and link to Startup
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log("Subscription changed:", subscription.id);
  
  // TODO: Update user subscription status in database
  // This would update the User model with:
  // - subscription tier
  // - billing period
  // - current period end
  // - status (active, trialing, etc.)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log("Subscription canceled:", subscription.id);
  
  // TODO: Update user account to free tier
  // Disable premium features
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("Payment succeeded:", invoice.id);
  
  // TODO: Log successful payment
  // Update billing history
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Payment failed:", invoice.id);
  
  // TODO: Notify user of failed payment
  // Mark account as past due
  // Potentially disable premium features after grace period
}
