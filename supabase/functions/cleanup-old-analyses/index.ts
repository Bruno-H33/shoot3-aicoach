import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RETENTION_DAYS = 180;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    const cutoff = cutoffDate.toISOString();

    // 1. Find old analyses
    const { data: oldAnalyses, error: fetchError } = await supabaseAdmin
      .from("analyses")
      .select("id, user_id, frames_urls")
      .lt("created_at", cutoff);

    if (fetchError) throw fetchError;
    if (!oldAnalyses || oldAnalyses.length === 0) {
      return new Response(
        JSON.stringify({ deleted: 0, message: "Nothing to clean up" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${oldAnalyses.length} analyses older than ${RETENTION_DAYS} days`);

    // 2. Delete storage frames for each analysis
    for (const analysis of oldAnalyses) {
      if (analysis.frames_urls && analysis.frames_urls.length > 0) {
        // Extract storage paths from URLs
        const paths = analysis.frames_urls
          .map((url: string) => {
            const match = url.match(/analysis-frames\/(.+)$/);
            return match ? match[1] : null;
          })
          .filter(Boolean);

        if (paths.length > 0) {
          await supabaseAdmin.storage.from("analysis-frames").remove(paths);
        }
      }

      // Also try to clean up the user folder for this analysis
      const folderPath = `${analysis.user_id}/${analysis.id}`;
      const { data: files } = await supabaseAdmin.storage
        .from("analysis-frames")
        .list(folderPath, { limit: 1000 });

      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${folderPath}/${f.name}`);
        await supabaseAdmin.storage.from("analysis-frames").remove(filePaths);
      }
    }

    // 3. Delete analyses from DB
    const ids = oldAnalyses.map((a) => a.id);
    const { error: deleteError } = await supabaseAdmin
      .from("analyses")
      .delete()
      .in("id", ids);

    if (deleteError) throw deleteError;

    console.log(`Cleaned up ${ids.length} old analyses`);

    return new Response(
      JSON.stringify({ deleted: ids.length, cutoff }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("cleanup error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
