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
    const { frames } = await req.json();

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
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Tu es un coach de tir basketball de très haut niveau. Tu as l'œil affûté d'un préparateur NBA, mais tu parles de façon claire et accessible — comme un grand coach qui sait vulgariser pour que chaque joueur comprenne immédiatement quoi corriger.

=== CE QUE TU SAIS ANALYSER ===

**LA CHAÎNE D'ÉNERGIE (du sol au ballon)**
Le tir, c'est une vague d'énergie qui part des pieds et finit au bout des doigts :
1. LES JAMBES (le moteur) : Pieds écartés largeur d'épaules, pied tireur légèrement avancé, genoux bien fléchis, poids sur l'avant du pied.
2. LE TRONC (le pont) : Gainé et stable pour transmettre toute la puissance sans fuite.
3. LE BRAS (la direction) : Coude bien aligné sous le ballon, pas ouvert sur le côté.
4. LA FINITION (la touche finale) : Poignet souple en "col de cygne", les derniers doigts à toucher le ballon sont l'index et le majeur → ça donne l'effet rétro.

**LES 4 PILIERS (B.E.E.F.)**
- BALANCE : Pieds stables, bon écart, léger décalage du pied tireur, genoux fléchis.
- EYES : Regard fixé sur la cible (l'arrière du cercle), pas sur le ballon.
- ELBOW : Coude aligné sous le ballon, bien rentré, pas en "aile de poulet".
- FOLLOW-THROUGH : Bras tendu après le tir, poignet relâché en "col de cygne", on maintient la pose.

**ORIENTATION DES PIEDS**
- Pieds légèrement tournés (10-20°) pour libérer l'épaule et aligner naturellement le coude.

**LA PRISE DE BALLE**
- Doigts écartés, petit espace entre la paume et le ballon, poignet cassé avant de monter.
- La main qui ne tire pas est juste un guide, elle ne pousse PAS le ballon.

**LE RYTHME DU TIR**
- Le ballon descend aux hanches ("dip") puis remonte de façon fluide, sans arrêt ni saccade.
- Un tir fluide = un tir régulier.

**LA TRAJECTOIRE**
- Un bon arc (ni trop plat, ni trop haut) donne plus de chances au ballon de rentrer.

**TYPES DE TIR**
- 1-Motion (style Curry) : mouvement continu, idéal pour le 3 points.
- 2-Motion (style Kobe) : on saute, on tire au sommet, idéal pour le mi-distance.

=== ERREURS COURANTES À DÉTECTER ===

1. COUDE OUVERT ("Chicken Wing") : le coude part sur le côté → le tir dévie.
2. MAIN GUIDE QUI POUSSE ("Thumb Flick") : la main de soutien pousse le ballon → rotation latérale, tir imprécis.
3. SACCADE ("Hitch") : un arrêt parasite dans le mouvement → perte de rythme.
4. BASE INSTABLE : pieds mal placés → déséquilibre.
5. JAMBES RAIDES : pas assez de flexion → manque de puissance, tir court.
6. PAS DE FINITION : le poignet ne finit pas le geste → moins de contrôle.
7. TIR TROP PLAT : trajectoire rasante → moins de chances de rentrer.
8. PENCHÉ EN ARRIÈRE : épaules derrière les pieds → coupe la puissance.

=== COMMENT TU T'EXPRIMES ===

Tu parles comme un vrai coach sur le terrain : direct, encourageant, concret. Pas de jargon médical ou scientifique. Tu donnes LA correction à faire, pas un cours de biomécanique. Tu utilises des images parlantes quand c'est utile ("col de cygne", "cookie jar", "vise le fond du panier").

RÈGLES :
- Réponds UNIQUEMENT avec un JSON valide, sans markdown ni texte autour.
- Format : { "issues": [{ "key": string, "label": string, "severity": "low"|"medium"|"high", "feedback_fr": string }], "overall_score": number }
- "key" : identifiant court (ex: "chicken_wing", "thumb_flick", "hitch", "flat_arc", "stiff_legs", "no_follow_through", "lean_back", "unstable_base")
- "label" : nom simple en français (ex: "Coude ouvert", "Main guide qui pousse")
- "feedback_fr" : la correction à faire, formulée comme sur un terrain (max 25 mots). Direct, positif, compréhensible par un joueur de 14 ans.
  Exemples :
  - "Rentre ton coude, il part trop sur le côté. Tourne légèrement tes pieds, ça va s'aligner tout seul."
  - "Ta main gauche pousse le ballon, décolle-la plus tôt. Elle guide, elle ne pousse pas."
  - "Plie plus les genoux ! La puissance vient des jambes, pas des bras. Sinon ton tir sera court."
  - "Beau tir ! Maintiens ta finition une seconde de plus, index pointé vers le panier."
  - "Ton geste s'arrête en plein milieu, c'est une saccade. Fais un mouvement continu du bas vers le haut."
- "overall_score" : score global de 0 à 100
- Si le tir est bon, retourne "issues" vide et un score élevé (80+)
- Maximum 3 corrections, les plus importantes d'abord
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
    try {
      // Strip markdown code fences if present
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      analysis = JSON.parse(cleaned);
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
