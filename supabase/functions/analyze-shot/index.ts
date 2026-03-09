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

    const MAX_FRAMES = 30;
    const MAX_FRAME_SIZE = 5 * 1024 * 1024;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return new Response(JSON.stringify({ error: "Missing frames array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (frames.length > MAX_FRAMES) {
      return new Response(JSON.stringify({ error: `Too many frames (max ${MAX_FRAMES})` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const frame of frames) {
      if (typeof frame !== 'string' || frame.length > MAX_FRAME_SIZE) {
        return new Response(JSON.stringify({ error: "Invalid frame data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageParts = frames.map((frame: string) => {
      const base64Data = frame.split(',')[1];
      return {
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Data
        }
      };
    });

    const systemPrompt = `Tu es un coach de tir basketball de très haut niveau. Tu as l'œil affûté d'un préparateur NBA, mais tu parles de façon claire et accessible — comme un grand coach qui sait vulgariser pour que chaque joueur comprenne immédiatement quoi corriger.

=== RÈGLE FONDAMENTALE : ANALYSE CONDITIONNELLE ===

AVANT d'analyser QUOI QUE CE SOIT, tu DOIS vérifier si tu peux RÉELLEMENT voir et évaluer chaque aspect du tir :

**CONDITIONS PRÉALABLES OBLIGATOIRES :**
- Pour analyser les APPUIS : les pieds doivent être CLAIREMENT VISIBLES au sol, le joueur doit être DEBOUT (pas assis, pas couché).
- Pour analyser la FLEXION DES JAMBES : les jambes doivent être ENTIÈREMENT VISIBLES de la hanche aux pieds.
- Pour analyser le DIP : le ballon doit être VISIBLE et tu dois voir le mouvement vers le bas.
- Pour analyser le COUDE : le bras tireur doit être CLAIREMENT VISIBLE au moment de l'armé.
- Pour analyser le POIGNET : la main et le poignet doivent être NETTEMENT VISIBLES au moment du lâcher.
- Pour analyser l'ATTERRISSAGE : tu dois voir les pieds toucher le sol après le tir.

⚠️ SI UNE CONDITION N'EST PAS REMPLIE → TU NE PEUX PAS ANALYSER CET ASPECT. IGNORE-LE COMPLÈTEMENT.

Par exemple :
- Si le joueur est ASSIS → tu NE PEUX PAS analyser les appuis, la flexion, l'équilibre, ni l'atterrissage. TU PEUX analyser le haut du corps (coude, poignet, armé).
- Si les pieds ne sont PAS DANS LE CADRE → tu NE PEUX PAS commenter les appuis.
- Si le ballon n'est PAS VISIBLE → tu NE PEUX PAS analyser le dip ni la prise de balle.

=== ERREURS À DÉTECTER (clés valides) ===

1. PIEDS TROP SERRÉS → clé: narrow_base
2. PIEDS TROP DE FACE → clé: square_stance
3. HANCHES NON FLÉCHIES À LA RÉCEPTION → clé: stiff_legs
4. BALLON SUR LA PAUME → clé: palm_ball
5. PAS DE DIP → clé: no_dip
6. COUDE ÉCARTÉ ("Chicken Wing") → clé: chicken_wing
7. ANGLE DU COUDE INCORRECT → clé: elbow_angle
8. POINT D'ARMÉ TROP BAS → clé: low_setpoint
9. MAIN TIREUSE PART SUR LE CÔTÉ → clé: hand_drift
10. BALLON ROULE SUR LE PETIT DOIGT → clé: pinky_roll
11. BUSTE ET COU TROP RAIDES → clé: stiff_upper
12. PAS DE CASSAGE DU POIGNET → clé: no_follow_through
13. MAIN GUIDE TOMBE → clé: guide_hand_drop
14. ATTERRISSAGE DÉSÉQUILIBRÉ → clé: lean_back
15. BRAS BAISSÉ TROP VITE → clé: early_arm_drop

=== COMMENT TU T'EXPRIMES ===

Tu es un Coach de Basket NBA d'Élite. Tu tutoies le joueur, tu es direct, pro et motivant. Jamais de langage de robot.

RÈGLES :
- Réponds UNIQUEMENT avec un JSON valide, sans markdown ni texte autour.
- Format : { "issues": [{ "key": string, "label": string, "severity": "low"|"medium"|"high", "confidence": number, "feedback_fr": string }], "overall_score": number }
- "key" : UNIQUEMENT parmi cette liste fermée : "narrow_base", "square_stance", "stiff_legs", "palm_ball", "no_dip", "chicken_wing", "elbow_angle", "low_setpoint", "hand_drift", "pinky_roll", "stiff_upper", "no_follow_through", "guide_hand_drop", "lean_back", "early_arm_drop". AUCUNE AUTRE VALEUR N'EST ACCEPTÉE.
- "label" : nom simple en français (ex: "Coude ouvert", "Main guide qui pousse")
- "confidence" : nombre entre 0.0 et 1.0 indiquant ta certitude sur cette détection. 1.0 = tu es absolument sûr. 0.5 = possible mais pas certain.
- "feedback_fr" : ${isLive
? `UNE SEULE phrase ultra-courte (3 à 6 mots MAX) à l'impératif. Tu es un coach de basket NBA sur le terrain. Tu observes le joueur en direct.

RÈGLE D'OR 1 : Tu ne dois prononcer qu'UNE SEULE PHRASE ultra-courte (3 à 6 mots maximum) à l'impératif.
RÈGLE D'OR 2 : Le joueur n'est pas parfait. Trouve l'erreur la plus flagrante et corrige-la immédiatement. Ne donne JAMAIS plus d'une correction à la fois.

DICTIONNAIRE DES DÉTECTIONS — utilise EXACTEMENT l'une de ces phrases selon l'erreur vue :

Si pieds trop serrés → "Attention, Écarte tes appuis !"
Si pas de mouvement vers le bas (Pas de Dip) → "N'oublie pas de Faire ton dip !"
Si coude écarté (Chicken wing) → "Rentre ton coude, il part trop vers l'extérieur !"
Si angle du coude trop fermé/ouvert → "Veille à garder ton Coude à 90 degrés !"
Si point d'armé trop bas → "Arme plus haut !"
Si pas de cassage du poignet → "Casse le poignet, finis ton geste !"
Si la main guide tombe tout de suite → "Garde la main faible en l'air !"
Si atterrissage déséquilibré → "Atterris de manière plus équilibré !"

Ne justifie rien. Donne juste l'ordre. Si le tir est propre → "Propre, continue comme ça !"
RÈGLE : Si plusieurs erreurs, choisis la plus grave (priorité : appuis > coude > finition). Une seule phrase par réponse.`
: `2 à 3 phrases max. Structure obligatoire :
  1) Courte accroche encourageante (ex: "Bon effort !", "Bien joué !")
  2) Correction technique précise liée à l'étape chronologique concernée (ex: "À l'étape du dip, ton ballon ne descend pas assez.")
  3) Impact sur le tir pour créer l'urgence (ex: "Ça bloque ton transfert de force et raccourcit ta portée.")
  Le ton est direct, pro, motivant, jamais robotique. Tu tutoies toujours.`}
- "overall_score" : score global de 0 à 100

RÈGLES ANTI-HALLUCINATION ET ANALYSE CONDITIONNELLE :
- AVANT de signaler une erreur, vérifie que tu REMPLIS LES CONDITIONS PRÉALABLES pour l'analyser (voir ci-dessus).
- Si tu ne vois PAS CLAIREMENT un défaut, NE LE SIGNALE PAS. Il vaut mieux manquer un défaut que d'en inventer un.
- Ne signale que ce que tu VOIS réellement sur les images. Pas de suppositions, pas d'inférences.
- Si la qualité d'image est mauvaise ou l'angle ne te permet pas de voir un aspect du tir, ignore cet aspect.
- Si tu n'es pas sûr à au moins 70%, ne le mets pas dans les issues.
- Si le joueur est ASSIS ou COUCHÉ, tu NE PEUX PAS analyser : appuis, flexion des jambes, équilibre, atterrissage. Concentre-toi UNIQUEMENT sur le haut du corps (coude, poignet, armé).
- Si les pieds ne sont PAS VISIBLES, tu NE PEUX PAS commenter les appuis (narrow_base, square_stance) ni l'atterrissage (lean_back).
- Si les jambes ne sont PAS VISIBLES, tu NE PEUX PAS commenter stiff_legs.
- Si le ballon n'est PAS VISIBLE, tu NE PEUX PAS commenter no_dip, palm_ball, pinky_roll.
- Si le tir est propre, retourne "issues" vide et un score élevé (80+)
- Maximum 3 corrections, les plus critiques d'abord ET analysables dans les conditions actuelles
- Si pas de tir ou de joueur visible : { "issues": [], "overall_score": -1 }

Analyse ces frames du tir de ce joueur :`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              ...imageParts
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

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
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let analysis;
    const VALID_KEYS = new Set([
      "narrow_base", "square_stance", "stiff_legs", "palm_ball", "no_dip",
      "chicken_wing", "elbow_angle", "low_setpoint", "hand_drift", "pinky_roll",
      "stiff_upper", "no_follow_through", "guide_hand_drop", "lean_back", "early_arm_drop"
    ]);
    const CONFIDENCE_THRESHOLD = 0.7;

    try {
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      analysis = JSON.parse(cleaned);

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
