import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SnovAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SnovCampaign {
  id: number;
  campaign: string;
  list_id: number;
  status: string;
  created_at: number;
  updated_at: number;
  started_at: number | null;
}

// Get Snov.io access token
async function getSnovAccessToken(): Promise<string> {
  const clientId = Deno.env.get("SNOV_USER_ID");
  const clientSecret = Deno.env.get("SNOV_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Snov.io credentials not configured");
  }

  console.log("Authenticating with Snov.io...");

  const response = await fetch("https://api.snov.io/v1/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Snov.io auth failed:", error);
    throw new Error(`Snov.io authentication failed: ${error}`);
  }

  const data: SnovAuthResponse = await response.json();
  console.log("Snov.io authentication successful");
  return data.access_token;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwt = authHeader.replace("Bearer ", "").trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(jwt);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching Snov.io campaigns for user ${claimsData.claims.sub}...`);

    // Get Snov.io access token
    const accessToken = await getSnovAccessToken();

    // Fetch all campaigns - Snov.io expects GET with access_token as query param
    const params = new URLSearchParams();
    params.append("access_token", accessToken);

    const response = await fetch(`https://api.snov.io/v1/get-user-campaigns?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch campaigns:", errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch Snov.io campaigns: ${errorText}`,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Snov.io returns an array directly
    const campaignsArray: SnovCampaign[] = await response.json();
    console.log(`Fetched ${Array.isArray(campaignsArray) ? campaignsArray.length : 0} campaigns`);
    console.log("Raw response:", JSON.stringify(campaignsArray).slice(0, 500));

    // Format campaigns for easier consumption
    const formattedCampaigns = Array.isArray(campaignsArray) 
      ? campaignsArray.map(c => ({
          id: c.id,
          name: c.campaign,
          listId: c.list_id,
          status: c.status,
          createdAt: c.created_at ? new Date(c.created_at * 1000).toISOString() : null,
          startedAt: c.started_at ? new Date(c.started_at * 1000).toISOString() : null,
        }))
      : [];

    return new Response(
      JSON.stringify({
        success: true,
        campaigns: formattedCampaigns,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in snov-get-campaigns:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
