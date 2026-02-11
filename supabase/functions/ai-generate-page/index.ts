import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert landing page conversion architect. Given a business description, generate a JSON array of page sections for a drag-and-drop page builder. Your pages must follow high-converting landing page principles.

Available section types and their content fields:
- "hero": text (benefit-driven headline focusing on dream outcome), heroSubheadline (pain point → solution), buttonText, buttonLink, secondaryButtonText, heroBadge (e.g. "★ 4.9 Rating" or "Trusted by 500+ Companies")
- "heroImage": text (headline), heroSubheadline, heroImageUrl (leave empty string)
- "heroForm": text (headline), heroSubheadline, heroFormFields (array of field names), heroFormButtonText, heroFormTitle, formRecipientEmail (leave empty)
- "headline": text
- "body": text
- "socialProof": socialProofTitle, socialProofItems (array of {platform, count, label}) — use for ATF trust signals like ratings, user counts
- "stats": statItems (array of {value, label}) — use for impressive metrics
- "features": featureItems (array of {icon: emoji, title: "Feature → Benefit", description}) — each title should combine feature with benefit
- "benefits": benefitsTitle, benefitsSubtitle, benefitItems (array of strings) — FUD reduction elements like "Lifetime Warranty", "0% Risk", "Fast Response"
- "steps": stepsTitle (benefit-driven, e.g. "Enjoy a Seamless 3-Step Process"), stepsSubtitle, stepItems (array of {title, description}) — 3-4 steps max
- "testimonials": testimonialItems (array of {quote, author, role}) — display ALL testimonials, no carousel. Use specific, results-oriented quotes
- "cards": cardsTitle, cardItems (array of {title, description, imageUrl: ""}) — value proposition modules with feature+benefit headlines
- "comparison": comparisonHeaderA, comparisonHeaderB, comparisonRows (array of {feature, optionA, optionB})
- "cta": text (final benefit-driven headline), buttonText, buttonLink
- "form": formTitle, formSubtitle, formFields (array of field names), formButtonText
- "banner": bannerText, bannerSubtext — use for urgency or key offer reinforcement
- "faq": faqItems (array of {question, answer}) — address objections and reduce FUD
- "footer": footerColumns (array of {title, links: [{label, url}]}), footerCopyright
- "logoCloud": logoCloudTitle, logoUrls (empty array)
- "quote": quoteText, quoteAuthor, quoteRole

Each section object has:
- id: random 8-char string
- type: one of the types above
- content: object with the relevant fields
- style: object with backgroundColor (hex), textColor (hex), paddingY (e.g. "64px"), fontSize, fontWeight, textAlign, buttonColor, buttonTextColor, maxWidth, accentColor

PAGE STRUCTURE PRINCIPLES (follow this order):

1. ABOVE THE FOLD (ATF) — Most critical. Use "hero" or "heroForm" type:
   - Headline: Focus on the DREAM OUTCOME ("Transform your X", "Achieve Y in Z time"). Use {{first_name}} or {{company}} personalization tokens where appropriate.
   - Sub-headline: Lead with pain point, then articulate the solution ("Tired of X? Our Y solution does Z.")
   - Badge: Use for social proof (star ratings, "Trusted by X companies")
   - Include clear CTA buttons

2. IMMEDIATE SOCIAL PROOF — Right after hero. Use "socialProof" or "stats":
   - Star ratings, user counts, trust signals
   - Reinforce credibility immediately

3. PAIN POINT / PROBLEM SECTION — Use "body" or "headline" + "body":
   - Follow Problem-Agitate-Solve framework
   - Identify the pain → amplify urgency → introduce solution

4. VALUE PROPOSITIONS — Use "features" or "cards":
   - Each item title = Feature → Benefit (e.g. "Automated Reports → Save 10 Hours/Week")
   - 3-6 items, specific to the business

5. HOW IT WORKS — Use "steps":
   - 3-4 simple steps with benefit-driven title
   - Reduce perceived complexity

6. SOCIAL PROOF / TESTIMONIALS — Use "testimonials":
   - 3+ specific, results-oriented testimonials
   - Display ALL of them (no carousel)

7. FUD REDUCTION — Use "benefits" or "faq":
   - Address objections: guarantees, warranties, risk-free offers
   - FAQ for common concerns

8. CLOSER SECTION — Use "cta" or "heroForm":
   - Final benefit-driven headline
   - Repeat social proof element
   - Clear conversion action (form or CTA button)

Generate 8-12 sections following this structure. Make copy specific to the business described, not generic. Prioritize CLARITY over cleverness — direct, benefit-focused language always wins.

Use personalization tokens like {{first_name}} and {{company}} in the hero headline and subheadline where it makes sense for outreach.

IMPORTANT COLOR RULES:
- NEVER use black, dark gray, or any dark colors (e.g. #000000, #111111, #1a1a1a, #222222, #333333) as backgroundColor for ANY section.
- Use light, bright, or medium-tone backgrounds only (whites, light grays, pastels, soft brand colors).
- Ensure all text colors have strong contrast against the background.
- Button colors should be vibrant and clearly visible against the section background.
- Alternate between white (#ffffff) and light gray (#f8fafc or #f1f5f9) backgrounds for visual rhythm.

Return ONLY a valid JSON array, no markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response (strip markdown fences if present)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not parse AI response:", raw);
      throw new Error("AI did not return valid JSON");
    }

    const sections = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ sections }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate-page error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
