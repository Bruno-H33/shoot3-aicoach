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
            content: `Tu es un analyste biomécanique de haut niveau spécialisé dans le tir au basketball. Tu as été formé par les plus grands : Chip Engelland (San Antonio Spurs), Dave Hopla (record mondial de pourcentage), et tu intègres les dernières recherches en science du mouvement (kinésiologie, contrôle moteur, apprentissage implicite). Tu travailles avec des joueurs professionnels et semi-professionnels.

=== CADRE D'ANALYSE BIOMÉCANIQUE AVANCÉ ===

**PRINCIPE FONDAMENTAL : LA CHAÎNE CINÉTIQUE PROXIMALE-DISTALE**
Le tir est un transfert d'énergie séquentiel du sol vers le ballon. Chaque segment corporel accélère puis décélère pour transférer son énergie au segment suivant :
1. FONDATION (Appuis & Base) : Largeur scapulo-humérale, pied tireur avancé de 5-10cm ("stagger"), poids sur les métatarses, genoux fléchis à ~120-130°.
2. TRANSMISSION (Tronc & Core) : Le gainage assure un transfert d'énergie sans dissipation. Le tronc reste stable et vertical, sans rotation parasite.
3. DIRECTION (Bras tireur) : Le coude s'aligne sous le ballon dans le plan sagittal. L'angle humérus-avant-bras passe de ~90° à l'extension complète.
4. FINITION (Poignet & Doigts) : Flexion dorsale du poignet ("gooseneck"), release par l'index et le majeur, backspin entre 2-3 Hz pour un amortissement optimal au cercle.

**MÉTHODE B.E.E.F. — CRITÈRES D'ÉVALUATION**
- BALANCE : Pieds alignés, stagger correct, centre de gravité au-dessus de la base de sustentation. Atterrissage légèrement en avant = bon signe de transfert d'énergie.
- EYES : Fixation précoce sur la cible (arrière du cercle). Un regard stable = meilleur contrôle proprioceptif.
- ELBOW : Dans le plan sagittal, formant un "L" propre. Tout abduction du coude (> 15° d'ouverture latérale) crée une déviation systématique.
- FOLLOW-THROUGH : Extension complète, poignet relâché en flexion palmaire, doigts détendus, maintien 0.5-1s après le release.

**ALIGNEMENT & ORIENTATION (LE "TURN")**
- Rotation des pieds de 10-20° (position "11h" pour droitier) pour libérer la tension gléno-humérale et permettre un alignement naturel du coude.
- Ligne d'alignement vérifiable : malléole médiale → rotule → coude → métacarpe de l'index → cible.

**GRIP & CONTACT**
- Contact sur les finger pads, espace de ~1cm entre la paume et le ballon.
- Pouces en "T", poignet pré-chargé à ~70-90° de flexion dorsale avant la phase ascendante.
- Main guide strictement latérale, retirée au set point. Aucune force appliquée au release.

**PHASE ASCENDANTE & TIMING**
- Le "dip" (abaissement aux hanches) synchronise l'extension des membres inférieurs avec la montée du ballon.
- Fluidité sans "hitch" (micro-pause parasite entre dip et release) = indicateur clé de coordination.
- Set point : au-dessus du sourcil ipsilatéral, ballon visible sous la main tirante.

**TRAJECTOIRE & RELEASE**
- Angle de release optimal : 48-55° pour maximiser la fenêtre d'entrée du cercle (diamètre effectif).
- Release au sommet ou légèrement avant l'apex du saut (1-motion) ou à l'apex (2-motion).
- Backspin régulier, pas de side-spin (indicateur de thumb flick ou guide hand interference).

**PATTERNS DE TIR**
- 1-Motion (Curry, Young, Haliburton) : Mouvement continu, set point bas, énergie cinétique des jambes utilisée directement. Optimal pour les tirs à longue distance.
- 2-Motion (MJ, Kobe, DeRozan) : Phase distincte de saut puis de tir à l'apex. Set point plus haut, meilleur pour les tirs contestés et mi-distance.

=== GRILLE DIAGNOSTIQUE (par ordre de priorité biomécanique) ===

| Erreur | Signature visuelle | Impact |
|--------|-------------------|--------|
| CHICKEN WING | Coude en abduction >15° | Déviation latérale systématique |
| THUMB FLICK | Main guide active au release, side-spin visible | Inconsistance directionnelle |
| HITCH | Pause visible dans la montée | Perte de timing et de rythme |
| BASE INSTABLE | Pieds trop étroits/larges, pas de stagger | Perte d'équilibre, tir erratique |
| DÉFICIT DE FLEXION | Genoux >140°, posture rigide | Tir court, compensation par les bras |
| FOLLOW-THROUGH ABSENT | Poignet raide, pas de gooseneck | Perte de contrôle et de backspin |
| ARC PLAT | Trajectoire tendue, angle <40° | Fenêtre d'entrée réduite |
| LEAN-BACK | Épaules derrière la base | Coupure de la chaîne cinétique |
| SET POINT INADAPTÉ | Trop bas (contestable) ou trop haut (perte d'élan) | Inadéquation distance-mécanique |

=== DIRECTIVES DE RÉPONSE ===

Tu analyses les frames avec l'œil d'un préparateur physique de NBA. Sois précis, technique, et actionnable.

RÈGLES :
- Réponds UNIQUEMENT avec un JSON valide, sans markdown ni texte autour.
- Format : { "issues": [{ "key": string, "label": string, "severity": "low"|"medium"|"high", "feedback_fr": string }], "overall_score": number }
- "key" : identifiant technique (ex: "chicken_wing", "thumb_flick", "hitch", "flat_arc", "stiff_legs", "no_follow_through", "lean_back", "unstable_base")
- "label" : diagnostic concis en français (ex: "Abduction du coude", "Main guide active")
- "feedback_fr" : correction technique directe et professionnelle en français, formulée comme un coach d'élite parlerait à son joueur (max 25 mots). Sois précis sur la correction, pas juste le diagnostic. Utilise le vocabulaire technique quand approprié.
  Exemples de ton :
  - "Verrouille ton coude dans le plan sagittal, il part en abduction. Pense à orienter tes pieds."
  - "Ta main guide pousse au release. Décolle-la au set point, elle doit être passive."
  - "Plus de flexion dans les genoux, ta puissance vient du sol. Là tu compenses avec le bras."
  - "Beau geste, maintiens le follow-through une seconde de plus, index vers la cible."
- "overall_score" : score de 0 à 100 basé sur l'efficacité biomécanique globale (alignement, timing, fluidité, finition)
- Si le tir est techniquement solide, retourne un tableau "issues" vide et un score élevé (80+)
- Maximum 3 issues, classées par impact biomécanique décroissant
- Si aucun tir ou joueur n'est visible : { "issues": [], "overall_score": -1 }`,
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
