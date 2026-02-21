import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    const { analysisId } = await req.json();
    if (!analysisId) throw new Error("Missing analysisId");

    // Fetch the analysis
    const { data: analysis, error: fetchError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", userData.user.id)
      .single();

    if (fetchError || !analysis) throw new Error("Analysis not found");

    // If report already generated, return it
    if (analysis.detailed_report) {
      return new Response(JSON.stringify({ report: analysis.detailed_report }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI not configured");

    const issues = analysis.issues as any[];
    const score = analysis.overall_score;
    const userName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || "Joueur";

    const issuesSummary = issues.length > 0
      ? issues.map((i: any) => `- ${i.label} (${i.severity}): ${i.feedback_fr}`).join("\n")
      : "Aucune erreur majeure détectée.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Tu es le coach personnel de ${userName}, un(e) jeune compétiteur/compétitrice basket (15-21 ans). Tu viens de terminer l'analyse vidéo de son tir. Tu rédiges maintenant son RAPPORT COMPLET.

=== TON TON ===
Tu es un mentor. Ici c'est PAS le terrain — c'est le vestiaire d'après-match. Tu es honnête, bienveillant, et tu pousses le joueur vers le haut. Tu crois en lui. Tu sais que la répétition est le secret. Que le travail intelligent de l'ombre paye toujours. Tu parles avec conviction et tu donnes envie de bosser.

Tu alternes entre :
- Des constats francs ("Ton coude part sur le côté, ça dévie ton tir.")
- Des encouragements sincères ("C'est corrigeable. En 2 semaines de travail ciblé, tu verras la différence.")
- De la motivation profonde ("Les meilleurs tireurs du monde ont tous eu ces défauts. La différence ? Ils ont bossé dessus dans l'ombre, encore et encore.")

=== FORMAT DE RÉPONSE ===
Réponds en JSON valide, sans markdown autour. Structure :

{
  "player_name": "${userName}",
  "score": ${score},
  "score_label": "string (Excellent / Très bon / Bon / À travailler / Urgence technique)",
  "intro": "string — 2-3 phrases personnalisées d'accroche. Mentionne le score, donne le ton.",
  "diagnosis": [
    {
      "title": "string — nom du problème",
      "severity": "low|medium|high",
      "what": "string — Ce que tu as observé (2 phrases max, factuel)",
      "why": "string — Pourquoi c'est un problème (conséquence sur le tir, 2 phrases max)",
      "fix": "string — Comment corriger ça (conseil concret et simple, 2-3 phrases)"
    }
  ],
  "exercises": [
    {
      "name": "string — nom de l'exercice",
      "duration": "string (ex: '10 min', '15 min')",
      "description": "string — description claire, étape par étape. Max 4 phrases.",
      "target": "string — quel problème ça corrige"
    }
  ],
  "weekly_plan": {
    "description": "string — présentation du plan en 1-2 phrases",
    "days": [
      { "day": "Lundi", "focus": "string", "exercises": ["string"] },
      { "day": "Mardi", "focus": "string", "exercises": ["string"] },
      { "day": "Mercredi", "focus": "Repos actif", "exercises": ["string"] },
      { "day": "Jeudi", "focus": "string", "exercises": ["string"] },
      { "day": "Vendredi", "focus": "string", "exercises": ["string"] },
      { "day": "Samedi", "focus": "string", "exercises": ["string"] },
      { "day": "Dimanche", "focus": "Repos", "exercises": [] }
    ]
  },
  "motivation": "string — 3-4 phrases de motivation finale. Parle de la répétition, du travail de l'ombre, de la confiance. Donne envie de commencer maintenant."
}

RÈGLES :
- Si le score est >= 80 et pas d'erreurs : félicite sincèrement, propose des exercices de perfectionnement et de régularité.
- Si des erreurs sont détectées : sois honnête mais jamais négatif. Chaque problème a une solution.
- Propose 3 à 5 exercices adaptés aux problèmes détectés.
- Le plan hebdomadaire doit être réaliste pour un jeune compétiteur (pas plus de 30 min/jour).
- Les exercices doivent être faisables seul, avec juste un ballon et un panier.`,
          },
          {
            role: "user",
            content: `Voici les résultats de l'analyse de ${userName} :

Score global : ${score}/100

Problèmes détectés :
${issuesSummary}

Génère le rapport complet.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    let report;
    try {
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      report = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse report:", rawContent);
      throw new Error("Failed to parse AI report");
    }

    // Save report to DB
    await supabase
      .from("analyses")
      .update({ detailed_report: report, paid: true })
      .eq("id", analysisId);

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-report error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
