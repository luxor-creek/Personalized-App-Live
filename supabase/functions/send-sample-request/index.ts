import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SampleRequest {
  name: string;
  company: string;
  role: string;
  audienceType: string;
  videoVolume: string;
  productUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, company, role, audienceType, videoVolume, productUrl }: SampleRequest = await req.json();

    // Validate required fields
    if (!name || !company || !productUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, company, and productUrl are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate URL format
    try {
      new URL(productUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending sample request email:", { name, company, role, audienceType, videoVolume, productUrl });

    const emailResponse = await resend.emails.send({
      from: "Sample Request <onboarding@resend.dev>",
      to: ["paul@kickervideo.com"],
      subject: `New Sample Video Request from ${name} at ${company}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            🎬 New Sample Video Request
          </h1>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Contact Information</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Company:</strong> ${company}</p>
            <p style="margin: 8px 0;"><strong>Role:</strong> ${role || "Not specified"}</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Project Details</h2>
            <p style="margin: 8px 0;"><strong>Audience Type:</strong> ${audienceType || "Not specified"}</p>
            <p style="margin: 8px 0;"><strong>Estimated Video Volume:</strong> ${videoVolume || "Not specified"}</p>
            <p style="margin: 8px 0;"><strong>Product URL:</strong> <a href="${productUrl}" style="color: #2563eb;">${productUrl}</a></p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This request was submitted via the Kicker Video sample request form.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Request sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-sample-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
