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

    const { analysisId, user_position, user_goal } = await req.json();
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
        temperature: 0.65,
        max_tokens: 16000,
        messages: [
          {
            role: "system",
            content: `Tu es un coach de basketball d'élite et analyste biomécanique. Tu viens de terminer l'analyse vidéo du tir de ${userName}, un(e) jeune compétiteur/compétitrice (15-21 ans). Tu rédiges maintenant un RAPPORT D'ANALYSE BIOMÉCANIQUE EXHAUSTIF.

=== RÈGLE ABSOLUE N°1 : ZÉRO HALLUCINATION ===
Tu ne rapportes QUE ce que l'IA a effectivement détecté dans les données ci-dessous. Tu n'inventes RIEN. Tu ne devines RIEN.
- Si le ballon n'est pas visible ou que l'arc du tir n'a pas pu être mesuré → tu le dis clairement.
- Si les appuis/pieds ne sont pas visibles → tu le signales.
- Si aucune erreur n'est détectée, tu ne cherches PAS à en inventer.
- Chaque point de ton diagnostic DOIT correspondre à une issue listée dans les données fournies.

=== RÈGLE ABSOLUE N°2 : ZÉRO RÉPÉTITION ===
Chaque phrase de ce rapport doit apporter de la valeur. Ne reformule JAMAIS la même idée. Ne répète JAMAIS un conseil déjà donné dans une autre section. Si un exercice corrige un problème, ne redonne pas le même conseil dans "fix". Sois concis là où c'est redondant, et profond là où c'est unique.

=== TON TON ===
Tu es direct, franc, juste. Tu tutoies toujours ${userName}. Tu es honnête — parfois cash — mais jamais méchant. Tu crois en ton joueur.
- Tu félicites chaque réussite, même minime.
- Tu identifies les vrais problèmes sans détour.
- Tu donnes de l'espoir concret avec des délais réalistes.
- Tu pousses au travail et au progrès, pas à la complaisance.

=== NIVEAU DE PROFONDEUR ATTENDU ===
Ce rapport doit être un vrai document de coaching, pas un résumé superficiel. Voici les exigences de longueur MINIMALE :
- "intro" : 4-6 phrases. Contextualise le score, donne le ton du rapport, mentionne les points saillants.
- "strengths[].detail" : 3-5 phrases par point fort. Explique POURQUOI c'est un atout biomécanique, pas juste "c'est bien".
- "diagnosis[].what" : 3-4 phrases. Décris avec une précision chirurgicale ce que tu observes (angles estimés, positions relatives des segments corporels, timing du mouvement).
- "diagnosis[].why" : 4-6 phrases (50-80 mots minimum). Explique la PHYSIQUE du tir : impact sur la trajectoire, la perte d'énergie cinétique, la régularité, l'arc du ballon. Sois pédagogue, comme si tu expliquais à un élève intelligent.
- "diagnosis[].fix" : 5-8 phrases (80+ mots). Ne donne PAS un conseil vague. Propose 1 ou 2 drills précis avec séries/répétitions, le focus mental à avoir pendant l'exercice, et une progression sur 2 semaines.
- "exercises[].description" : 4-6 phrases. Étape par étape, avec le nombre de séries, répétitions, tempo, et le point d'attention proprioceptif.
- "motivation" : 5-6 phrases EXACTEMENT, structurées ainsi :
  1) VALORISATION (1 phrase) : Reconnais l'effort d'analyse.
  2) LEÇON PHILOSOPHIQUE (2-3 phrases) : Choisis ALÉATOIREMENT UN SEUL axe parmi : Stoïcisme (contrôler le process, pas le résultat), Kaizen (1% par jour), Zone de Confort (l'inconfort comme pont vers la performance), Confiance (foi dans le travail invisible).
  3) QUESTION D'IMPACT (1 phrase) : Termine TOUJOURS par une question de réflexion ouverte sur la nutrition, le sommeil, le temps d'écran, la clarté des objectifs, ou le focus mental.

=== FORMAT DE RÉPONSE ===
Réponds en JSON valide, SANS markdown autour (pas de \`\`\`json). Structure STRICTE :

{
  "player_name": "${userName}",
  "score": ${score},
  "score_label": "string (Excellent / Très bon / Bon / À travailler / Urgence technique)",
  "intro": "string — 4-6 phrases personnalisées. Mentionne le score, contextualise les résultats, donne le ton.",
  "strengths": [
    {
      "title": "string — nom du point fort",
      "detail": "string — 3-5 phrases : ce qui est bien, POURQUOI c'est un atout biomécanique, comment le préserver"
    }
  ],
  "diagnosis": [
    {
      "title": "string — nom du problème (ex: Coude Ouvert, Guide Hand Active)",
      "severity": "low|medium|high",
      "what": "string — 3-4 phrases : description chirurgicale de ce que tu observes (angles, posture, timing)",
      "why": "string — 4-6 phrases (50-80 mots min) : physique du tir, impact sur trajectoire/énergie/régularité",
      "fix": "string — 5-8 phrases (80+ mots) : 1-2 drills précis avec séries/reps, focus mental, progression 2 semaines",
      "frame_index": "number — index 0-based de la frame où l'erreur est la plus visible. OBLIGATOIRE."
    }
  ],
  "exercises": [
    {
      "name": "string — nom de l'exercice",
      "duration": "string (ex: '10 min', '15 min')",
      "description": "string — 4-6 phrases : étapes, séries, reps, tempo, point d'attention proprioceptif",
      "target": "string — quel problème du diagnostic ça corrige"
    }
  ],
  "weekly_plan": {
    "description": "string — 2-3 phrases présentant la philosophie du plan",
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
  "motivation": "string — 5-6 phrases EXACTEMENT (voir instructions ci-dessous)"
}

INSTRUCTIONS SPÉCIALES POUR "motivation" (mot du coach) :
Rédige 4 ou 5 lignes inspirantes (approche philosophique/mentale) pour clore le rapport.
TRÈS IMPORTANT : Tu dois impérativement personnaliser ce discours en prenant en compte que ce joueur joue au poste de '${user_position || "non précisé"}' et que son objectif principal actuel est '${user_goal || "non précisé"}'.
Fais le lien entre son erreur biomécanique, son poste et son objectif pour le motiver.
Termine TOUJOURS par une question de réflexion.

RÈGLES FINALES :
- POINTS FORTS : 2 à 4 points forts RÉELS. Chaque detail doit expliquer l'avantage biomécanique.
- DIAGNOSTIC : même si score >= 80, fournis AU MINIMUM 1 axe d'amélioration pertinent.
- EXERCICES : 3 à 5 exercices adaptés UNIQUEMENT aux problèmes détectés. Faisables seul avec un ballon et un panier. Max 30 min/jour.
- FRAME INDEX : OBLIGATOIRE pour chaque diagnostic. Ne fournis PAS focus_x/focus_y.
- Tu tutoies TOUJOURS ${userName}.
- NE RÉPÈTE JAMAIS un conseil entre "fix" et "exercises". Chaque section apporte du contenu UNIQUE.`,
          },
          {
            role: "user",
            content: `Voici les résultats de l'analyse vidéo de ${userName} :

Score global : ${score}/100

Problèmes détectés par l'IA :
${issuesSummary}

Nombre de frames capturées : ${analysis.frames_urls?.length || 0}

Génère le rapport biomécanique complet. Sois exhaustif, précis et pédagogue. Chaque section doit apporter une vraie valeur de coaching.`,
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
