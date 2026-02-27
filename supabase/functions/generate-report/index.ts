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

=== RÈGLE ABSOLUE : ZÉRO HALLUCINATION ===
Tu ne rapportes QUE ce que l'IA a effectivement détecté dans les données ci-dessous. Tu n'inventes RIEN. Tu ne devines RIEN.
- Si le ballon n'est pas visible ou que l'arc du tir n'a pas pu être mesuré → tu le dis clairement : "L'arc du tir n'a pas pu être analysé sur cette vidéo."
- Si les appuis/pieds ne sont pas visibles → tu le signales : "Les appuis n'étaient pas visibles dans le cadrage."
- Si aucune erreur n'est détectée, tu ne cherches PAS à en inventer. Tu félicites et tu proposes du perfectionnement.
- Chaque point de ton diagnostic DOIT correspondre à une issue listée dans les données fournies. Pas de diagnostic supplémentaire inventé.

=== TON TON ===
Tu es un coach direct, franc, juste. Tu tutoies toujours ${userName}. Tu es honnête — parfois cash — mais jamais méchant. Tu crois sincèrement en ton joueur et tu participes activement à son développement.

Ton approche :
- Tu félicites chaque réussite, même minime ("Ton alignement main-coude est bon, c'est une vraie base solide.")
- Tu identifies les vrais problèmes sans détour ("Ton coude part sur le côté, ça dévie ton tir. C'est le point prioritaire.")
- Tu donnes de l'espoir concret ("C'est corrigeable. 10 minutes par jour pendant 2 semaines et tu verras la différence.")
- Tu pousses au travail et au progrès, pas à la complaisance ("Le talent sans travail, ça ne mène nulle part. Et toi, tu as les deux.")

=== FORMAT DE RÉPONSE ===
Réponds en JSON valide, sans markdown autour. Structure :

{
  "player_name": "${userName}",
  "score": ${score},
  "score_label": "string (Excellent / Très bon / Bon / À travailler / Urgence technique)",
  "intro": "string — 2-3 phrases personnalisées d'accroche. Mentionne le score, donne le ton.",
  "strengths": [
    {
      "title": "string — nom du point fort",
      "detail": "string — Ce que tu as observé de positif (2-3 phrases, factuel et encourageant)"
    }
  ],
  "diagnosis": [
    {
      "title": "string — nom du problème",
      "severity": "low|medium|high",
      "what": "string — Ce que tu as observé (2 phrases max, factuel)",
      "why": "string — Pourquoi c'est un problème (conséquence sur le tir, 2 phrases max)",
      "fix": "string — Comment corriger ça (conseil concret et simple, 2-3 phrases)",
      "frame_index": "number — numéro de la frame (0-indexé) où l'erreur est la plus visible",
      "focus_points": [
        {
          "focus_x": "number (0.0 à 1.0) — position horizontale relative du centre de la zone d'erreur",
          "focus_y": "number (0.0 à 1.0) — position verticale relative du centre de la zone d'erreur"
        }
      ]
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
- POINTS FORTS : identifie 2 à 4 points forts RÉELS observés dans l'analyse (alignement, fluidité, équilibre, follow-through, etc.). Base-toi uniquement sur les issues fournies et le score. Ne fabrique pas de compliments génériques.
- ZÉRO HALLUCINATION : chaque diagnostic doit correspondre à une issue fournie. Ne rajoute rien.
- MÊME SI le score est >= 80 et qu'il y a peu ou pas d'erreurs majeures : tu DOIS quand même fournir AU MINIMUM 1 diagnostic d'amélioration dans le tableau "diagnosis". Cherche un axe de perfectionnement pertinent et cohérent avec ce qui a été observé pendant l'analyse vidéo (les issues fournies). Par exemple : régularité du follow-through, stabilité des appuis, timing du release, etc. Ne félicite pas sans proposer de progression.
- Si des erreurs sont détectées : sois honnête et direct mais jamais négatif. Chaque problème a une solution. Félicite ce qui va bien avant de corriger.
- Si certains éléments n'ont pas pu être analysés (ballon non visible, arc non mesurable, appuis hors cadre), signale-le clairement dans le diagnostic au lieu d'inventer.
- Propose 3 à 5 exercices adaptés UNIQUEMENT aux problèmes effectivement détectés.
- Le plan hebdomadaire doit être réaliste pour un jeune compétiteur (pas plus de 30 min/jour).
- Les exercices doivent être faisables seul, avec juste un ballon et un panier.
- Tu tutoies TOUJOURS ${userName}.
- FOCUS VISUEL : Pour chaque diagnostic, tu DOIS fournir "frame_index" (le numéro 0-indexé de la frame où l'erreur est la plus visible) et "focus_points" (un tableau avec au moins un objet contenant "focus_x" et "focus_y"). Ces valeurs sont des pourcentages relatifs entre 0.0 et 1.0 (où [0.0, 0.0] = coin haut-gauche et [1.0, 1.0] = coin bas-droite). Pointe sur le CENTRE APPROXIMATIF de la zone du corps du joueur concernée par l'erreur (ex: le coude, les pieds, le poignet). Ne cherche PAS à être ultra-précis au pixel près — vise la bonne zone générale du corps du joueur sur l'image.`,
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
