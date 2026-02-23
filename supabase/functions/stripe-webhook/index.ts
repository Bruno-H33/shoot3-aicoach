import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credits per price ID
const CREDITS_MAP: Record<string, number> = {
  "price_1T347IRKXHvnBBog16QQGxBo": 15, // Sniper Elite
  "price_1T3irvRKXHvnBBogPa9edglS": 8,  // Pass Team Shoot3
  "price_1T345HRKXHvnBBog0jfr2XdU": 1,  // Rapport d'Analyse
};

const log = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("ERROR", "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Server config error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    log("ERROR", "Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: any) {
    log("ERROR", { message: `Webhook verification failed: ${err.message}` });
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  log("Event received", { type: event.type, id: event.id });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email || session.customer_email;

    if (!customerEmail) {
      log("ERROR", "No customer email in session");
      return new Response("No email", { status: 400 });
    }

    log("Processing checkout", { email: customerEmail, sessionId: session.id });

    // Get line items to determine which product was purchased
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      log("ERROR", "No price ID found in line items");
      return new Response("No price", { status: 400 });
    }

    const creditsToAdd = CREDITS_MAP[priceId];
    if (!creditsToAdd) {
      log("INFO", { message: "Price not in credits map, skipping", priceId });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("Adding credits", { priceId, creditsToAdd });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find user by email
    const { data: users, error: userErr } = await supabaseAdmin.auth.admin.listUsers();
    if (userErr) {
      log("ERROR", { message: "Failed to list users", error: userErr.message });
      return new Response("User lookup failed", { status: 500 });
    }

    const user = users.users.find((u) => u.email === customerEmail);
    if (!user) {
      log("ERROR", { message: "User not found for email", email: customerEmail });
      return new Response("User not found", { status: 404 });
    }

    // Get current credits
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (profileErr || !profile) {
      log("ERROR", { message: "Profile not found", userId: user.id });
      return new Response("Profile not found", { status: 404 });
    }

    const newCredits = (profile.credits || 0) + creditsToAdd;
    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({ credits: newCredits })
      .eq("user_id", user.id);

    if (updateErr) {
      log("ERROR", { message: "Failed to update credits", error: updateErr.message });
      return new Response("Update failed", { status: 500 });
    }

    log("Credits updated", { userId: user.id, previousCredits: profile.credits, newCredits });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
