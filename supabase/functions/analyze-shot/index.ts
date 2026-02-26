import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { frames, context } = await req.json();
    const isLive = context === "live";

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return new Response(JSON.stringify({ error: "Missing frames array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build vision messages with the captured frames
    const imageContents = frames.map((frame: string) => ({
      type: "image_url" as const,
      image_url: { url: frame }, // data:image/jpeg;base64,... format
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Tu es un coach de tir basketball de très haut niveau. Tu as l'œil affûté d'un préparateur NBA, mais tu parles de façon claire et accessible — comme un grand coach qui sait vulgariser pour que chaque joueur comprenne immédiatement quoi corriger.

=== CHECKLIST BIOMÉCANIQUE CHRONOLOGIQUE ===

Analyse les frames dans l'ordre chronologique du tir. Pour chaque étape, identifie, isole et évalue ce que tu VOIS :

**ÉTAPE 1 — APPUIS & POSTURE DE BASE (Équilibre)**
- Pieds écartés largeur d'épaules, pied tireur légèrement avancé (1-2 cm).
- Pieds légèrement tournés (10-20°) pour libérer l'épaule et aligner le coude.
- Poids réparti sur l'avant des pieds, genoux fléchis, tronc gainé.
- Centre de gravité bas et stable.

**ÉTAPE 2 — CINÉTIQUE GLOBALE (Coordination)**
- Vague d'énergie fluide : flexion des jambes → poussée → détente → lâcher.
- Pas de rupture ni de saccade dans la chaîne cinétique.
- Synchronisation jambes-bras : les jambes poussent AVANT que le bras ne monte.
- Le tronc reste gainé pour transmettre la puissance sans fuite.

**ÉTAPE 3 — DIP / POCKET (Abaissement du ballon)**
- Le ballon descend aux hanches ("dip") avant de remonter.
- Le mouvement est fluide, sans pause ni hésitation.
- Le "dip" permet d'engager la puissance des jambes dans le tir.
- La prise de balle est correcte : doigts écartés, espace paume-ballon, poignet cassé.

**ÉTAPE 4 — ANGLE DU COUDE ARMÉ (≈ 90°)**
- Au moment de l'armé, le coude forme un angle proche de 90°.
- L'avant-bras est perpendiculaire au sol ou légèrement incliné.

**ÉTAPE 5 — ALIGNEMENT DU COUDE**
- Le coude est bien SOUS le ballon, pas écarté sur le côté.
- Pas d'"aile de poulet" (chicken wing) : coude aligné avec le genou et le pied tireur.
- La main guide est juste un support latéral, elle ne pousse PAS le ballon.

**ÉTAPE 6 — EXTENSION DU BRAS**
- Le coude finit AU-DESSUS de la ligne des yeux lors de l'extension.
- Le bras se déplie complètement, pas de retenue.
- La puissance vient principalement des jambes, le bras dirige.

**ÉTAPE 7 — FOUETTÉ DU POIGNET (Col de Cygne / Gooseneck)**
- Le poignet claque vers l'avant de façon souple et relâchée.
- Les derniers doigts à toucher le ballon sont l'index et le majeur → effet rétro.
- Le poignet termine en position "col de cygne" naturelle.

**ÉTAPE 8 — FOLLOW-THROUGH / LÂCHÉ**
- Bras tendu après le lâcher, on MAINTIENT la pose (freeze).
- Doigts pointés vers le cercle, main relâchée.
- Arc de tir ni trop plat (manque de marge) ni trop haut (perte de précision).
- Le regard est fixé sur la cible (arrière du cercle), pas sur le ballon.

=== ERREURS À DÉTECTER (clés valides) ===

1. COUDE OUVERT ("Chicken Wing") → clé: chicken_wing
2. MAIN GUIDE QUI POUSSE ("Thumb Flick") → clé: thumb_flick
3. SACCADE dans le mouvement ("Hitch") → clé: hitch
4. TIR TROP PLAT → clé: flat_arc
5. JAMBES RAIDES → clé: stiff_legs
6. PAS DE FOLLOW-THROUGH → clé: no_follow_through
7. PENCHÉ EN ARRIÈRE → clé: lean_back
8. BASE INSTABLE → clé: unstable_base

=== COMMENT TU T'EXPRIMES ===

Tu es un Coach de Basket NBA d'Élite. Tu tutoies le joueur, tu es direct, pro et motivant. Jamais de langage de robot.

RÈGLES :
- Réponds UNIQUEMENT avec un JSON valide, sans markdown ni texte autour.
- Format : { "issues": [{ "key": string, "label": string, "severity": "low"|"medium"|"high", "confidence": number, "feedback_fr": string }], "overall_score": number }
- "key" : UNIQUEMENT parmi cette liste fermée : "chicken_wing", "thumb_flick", "hitch", "flat_arc", "stiff_legs", "no_follow_through", "lean_back", "unstable_base". AUCUNE AUTRE VALEUR N'EST ACCEPTÉE.
- "label" : nom simple en français (ex: "Coude ouvert", "Main guide qui pousse")
- "confidence" : nombre entre 0.0 et 1.0 indiquant ta certitude sur cette détection. 1.0 = tu es absolument sûr. 0.5 = possible mais pas certain.
- "feedback_fr" : ${isLive
? `UNE SEULE phrase très courte (max 8 mots). Tu es un coach qui crie une instruction pendant l'action. Pas de bonjour, pas d'explication, juste la correction immédiate.
  Exemples :
  - "Rentre ton coude !"
  - "Fléchis plus les genoux !"
  - "Finis ton geste, col de cygne !"
  - "Attention, ton coude s'écarte !"
  - "Propre, continue !" (si le tir est bon)`
: `2 à 3 phrases max. Structure obligatoire :
  1) Courte accroche encourageante (ex: "Bon effort !", "Bien joué !")
  2) Correction technique précise liée à l'étape chronologique concernée (ex: "À l'étape du dip, ton ballon ne descend pas assez.")
  3) Impact sur le tir pour créer l'urgence (ex: "Ça bloque ton transfert de force et raccourcit ta portée.")
  Le ton est direct, pro, motivant, jamais robotique. Tu tutoies toujours.`}
- "overall_score" : score global de 0 à 100

RÈGLES ANTI-HALLUCINATION :
- Si tu ne vois PAS CLAIREMENT un défaut, NE LE SIGNALE PAS. Il vaut mieux manquer un défaut que d'en inventer un.
- Ne signale que ce que tu VOIS réellement sur les images. Pas de suppositions, pas d'inférences.
- Si la qualité d'image est mauvaise ou l'angle ne te permet pas de voir un aspect du tir, ignore cet aspect.
- Si tu n'es pas sûr à au moins 70%, ne le mets pas dans les issues.
- Si le tir est propre, retourne "issues" vide et un score élevé (80+)
- Maximum 3 corrections, les plus critiques d'abord
- Si pas de tir ou de joueur visible : { "issues": [], "overall_score": -1 }`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse ces frames du tir de ce joueur :" },
              ...imageContents,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the AI response
    let analysis;
    const VALID_KEYS = new Set([
      "chicken_wing", "thumb_flick", "hitch", "flat_arc",
      "stiff_legs", "no_follow_through", "lean_back", "unstable_base"
    ]);
    const CONFIDENCE_THRESHOLD = 0.7;

    try {
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      analysis = JSON.parse(cleaned);

      // Filter: only keep issues with valid keys AND high confidence
      if (Array.isArray(analysis.issues)) {
        analysis.issues = analysis.issues.filter((issue: any) =>
          VALID_KEYS.has(issue.key) &&
          typeof issue.confidence === "number" &&
          issue.confidence >= CONFIDENCE_THRESHOLD
        );
      }
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      analysis = { issues: [], overall_score: -1 };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-shot error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
