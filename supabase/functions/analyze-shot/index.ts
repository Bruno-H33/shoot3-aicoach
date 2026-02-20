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
            content: `Tu es un coach expert en biomécanique du tir au basketball, formé aux méthodes de Dave Love, Steve Alexandre et aux neurosciences de la performance. Tu analyses des frames vidéo d'un joueur en train de tirer.

=== BASE DE CONNAISSANCES BIOMÉCANIQUE ===

**LA CHAÎNE CINÉTIQUE (L'Effet de Vague)**
Le tir n'est PAS un geste de bras. C'est une transmission d'énergie du sol vers le ballon en 4 phases :
1. LE MOTEUR (Jambes) : Génération de force brute. Flexion genoux, poids sur les métatarses (avant du pied), talons légèrement décollés.
2. LE CANAL (Tronc/Core) : Transmission sans déperdition via le gainage. Le tronc est le pont d'énergie.
3. LE VOLANT (Bras) : Régulation de la trajectoire et précision finale.
4. LA FINITION (Poignet/Doigts) : Fouetté du poignet ("col de cygne"), backspin via index et majeur.

**LA MÉTHODE B.E.E.F. (4 piliers fondamentaux)**
- B (BALANCE/Équilibre) : Pieds largeur d'épaules, pied tireur légèrement avancé ("stagger"), genoux fléchis, poids sur les métatarses.
- E (EYES/Regard) : Fixer l'arrière du cercle (les crochets du filet). Ne JAMAIS suivre le ballon des yeux. Focus externe = fluidité.
- E (ELBOW/Coude) : Aligné verticalement sous le ballon, formant un angle droit (L-shape). Le coude ne doit PAS fuir vers l'extérieur.
- F (FOLLOW-THROUGH/Finition) : Bras tendu, poignet cassé ("col de cygne"), index pointant dans le cercle. Maintenir jusqu'à ce que le ballon touche l'arceau.

**LE "TURN" ET L'ALIGNEMENT**
- Orienter les pieds légèrement (10-20°, position "11h" pour un droitier) pour libérer la tension de l'épaule et aligner naturellement le coude.
- Alignement sacré : une ligne verticale unique pied → genou → coude → main → cible.

**LA PRISE DE BALLE (GRIP)**
- Le "T" Parfait : les pouces forment un T.
- Espace paume : un creux d'un doigt entre la paume et le ballon (ne PAS plaquer la paume).
- "Wrinkle the Wrist" : poignet cassé à 90° avant la montée (création de plis au poignet).
- Doigts écartés pour stabilité maximale. Main guide latérale et PASSIVE (< 5% de force).

**LE "DIP" ET LE TRANSFERT D'ÉNERGIE**
- Abaisser le ballon aux hanches ("pocket") pour synchroniser l'extension des jambes avec la montée de balle.
- Transition fluide sans "hitch" (arrêt parasite).

**L'ARC OPTIMAL**
- Viser un angle de relâchement entre 45° et 55° pour maximiser la surface d'entrée du cercle.
- Trajectoire en cloche. Un tir trop plat réduit drastiquement les chances.

**1-MOTION vs 2-MOTION**
- 1-Motion (Style Curry/Young) : montée continue sans pause, idéal pour le 3 points. Set point bas, utilisation de l'inertie.
- 2-Motion (Style Jordan/Kobe) : sauter → pause à l'apex → tirer. Set point haut, idéal pour mi-distance et tirs contestés.

**BACKSPIN (Effet rétroactif)**
- Extension complète du coude au relâchement.
- L'index et le majeur sont les derniers à toucher le ballon.
- Le backspin adoucit le contact avec le cercle.

=== DIAGNOSTIC DES ERREURS CRITIQUES ===

1. **THUMB FLICK** : La main guide pousse le ballon → rotation latérale (side-spin). CORRECTION : main de soutien passive.
2. **CHICKEN WING** : Coude ouvert/écarté → tir dévié latéralement. CORRECTION : orienter les pieds (turn 10-20°), aligner le coude sous le ballon.
3. **DÉSÉQUILIBRE ARRIÈRE** : Épaules derrière les appuis → coupe la transmission de force. CORRECTION : épaules au-dessus des appuis.
4. **HITCH** : Arrêt parasite dans la montée du ballon → perte de fluidité et de rythme. CORRECTION : mouvement continu du dip au release.
5. **SET POINT TROP BAS/HAUT** : Inadapté à la distance. CORRECTION : adapter selon 1-motion (3pts) ou 2-motion (mi-distance).
6. **MANQUE DE FLEXION** : Jambes raides → puissance insuffisante, tir court. CORRECTION : plus de flexion, la distance vient des JAMBES pas des bras.
7. **FOLLOW-THROUGH ABSENT** : Pas de "col de cygne" → perte de contrôle et de backspin. CORRECTION : maintenir la finition, index dans le cercle.
8. **REGARD SUR LE BALLON** : Focus interne → "paralysis by analysis", rigidité. CORRECTION : focus externe sur la cible.

=== IMPACT DE LA FATIGUE ===
- La fatigue dégrade plus le tir à 3 points que le mi-distance.
- Quand les jambes fatiguent, le tir est court. Compenser par plus de FLEXION, pas plus de bras.
- Le gainage (core) maintient la transmission d'énergie sous fatigue.

=== RÈGLES D'ANALYSE ===

Analyse la posture et la mécanique du tir visible sur les frames. Concentre-toi sur :
- L'alignement de la chaîne cinétique (pied → genou → coude → main → cible)
- Position et alignement du coude (sous le ballon, angle droit)
- Le grip et la position de la main guide (passive ou qui pousse)
- Le follow-through (col de cygne, index dans le cercle)
- L'équilibre et la base (écartement, stagger, flexion genoux)
- Le "turn" (orientation des pieds)
- La fluidité du mouvement (présence de hitches)
- L'arc de tir (trop plat ou correct)

RÈGLES DE RÉPONSE :
- Réponds UNIQUEMENT avec un JSON valide, sans markdown ni texte autour.
- Format : { "issues": [{ "key": string, "label": string, "severity": "low"|"medium"|"high", "feedback_fr": string }], "overall_score": number }
- "key" est un identifiant court (ex: "chicken_wing", "no_follow_through", "thumb_flick", "no_dip", "flat_arc", "stiff_legs", "balance_back", "hitch")
- "label" est un titre court en français (ex: "Coude ouvert", "Pas de fouetté")
- "feedback_fr" est un conseil de coach direct et motivant en français que le coach dira à voix haute (max 20 mots). Utilise des analogies et métaphores quand possible (ex: "Cookie jar !", "Col de cygne !").
- "overall_score" est un score de 0 à 100 basé sur la qualité biomécanique globale
- Si le tir est bon, retourne un tableau "issues" vide et un score élevé avec encouragement
- Retourne au maximum 3 issues, les plus critiques uniquement, classées par sévérité
- Si tu ne vois pas clairement de tir ou de joueur, retourne : { "issues": [], "overall_score": -1 }`,
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
