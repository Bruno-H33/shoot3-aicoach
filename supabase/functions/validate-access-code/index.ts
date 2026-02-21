import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string" || code.length > 50) {
      return new Response(JSON.stringify({ valid: false, error: "Code invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: codeData, error } = await supabase
      .from("access_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !codeData) {
      return new Response(JSON.stringify({ valid: false, error: "Code introuvable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, error: "Code expiré" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (codeData.current_uses >= codeData.max_uses) {
      return new Response(JSON.stringify({ valid: false, error: "Code épuisé (limite atteinte)", remaining: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment usage
    await supabase
      .from("access_codes")
      .update({ current_uses: codeData.current_uses + 1 })
      .eq("id", codeData.id);

    // Log usage
    await supabase.from("access_code_uses").insert({ code_id: codeData.id });

    const remaining = codeData.max_uses - codeData.current_uses - 1;

    return new Response(JSON.stringify({ valid: true, remaining }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ valid: false, error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
