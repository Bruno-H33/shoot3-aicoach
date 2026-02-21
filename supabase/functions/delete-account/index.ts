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

    // User client to verify identity
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    const userId = userData.user.id;

    // Admin client for deletion operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Delete storage frames
    const { data: files } = await supabaseAdmin.storage
      .from("analysis-frames")
      .list(userId, { limit: 1000 });

    if (files && files.length > 0) {
      // List all subfolders and files recursively
      for (const file of files) {
        const subPath = `${userId}/${file.name}`;
        const { data: subFiles } = await supabaseAdmin.storage
          .from("analysis-frames")
          .list(subPath, { limit: 1000 });
        
        if (subFiles && subFiles.length > 0) {
          const paths = subFiles.map((f) => `${subPath}/${f.name}`);
          await supabaseAdmin.storage.from("analysis-frames").remove(paths);
        }
      }
    }

    // 2. Delete analyses
    await supabaseAdmin.from("analyses").delete().eq("user_id", userId);

    // 3. Delete profile
    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);

    // 4. Delete auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("delete-account error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
