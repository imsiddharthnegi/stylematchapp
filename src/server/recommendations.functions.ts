import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ProductInput = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullable().optional(),
  price: z.number(),
});

const Input = z.object({
  preferences: z.object({
    vibe: z.string().nullable().optional(),
    colors: z.array(z.string()).optional(),
    priceRange: z.tuple([z.number(), z.number()]).optional(),
    fit: z.string().nullable().optional(),
  }),
  products: z.array(ProductInput).max(6),
});

export type RecommendationReason = { id: string; reason: string };

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const generateRecommendationReasons = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<{ reasons: RecommendationReason[]; error: string | null }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reasons: [], error: "AI service not configured" };
    }

    const { preferences, products } = data;
    const prefSummary = [
      preferences.vibe ? `${preferences.vibe} vibe` : null,
      preferences.colors?.length ? `colors: ${preferences.colors.join(", ")}` : null,
      preferences.priceRange
        ? `budget $${preferences.priceRange[0]}-$${preferences.priceRange[1]}`
        : null,
      preferences.fit ? `${preferences.fit} fit` : null,
    ]
      .filter(Boolean)
      .join("; ");

    const results = await Promise.all(
      products.map(async (p) => {
        try {
          const res = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a concise fashion stylist. Reply with ONE short sentence (max 18 words) explaining why a product matches a user's style. No quotes, no preamble.",
                },
                {
                  role: "user",
                  content: `User style: ${prefSummary || "unspecified"}. Product: ${p.name}, ${p.category ?? "apparel"}, $${p.price}. Why does this match?`,
                },
              ],
              max_tokens: 60,
              temperature: 0.7,
            }),
          });

          if (!res.ok) {
            console.error(`AI gateway ${res.status} for ${p.id}`);
            return { id: p.id, reason: "" };
          }
          const json = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const reason = json.choices?.[0]?.message?.content?.trim() ?? "";
          return { id: p.id, reason: reason.replace(/^["']|["']$/g, "") };
        } catch (err) {
          console.error("AI reason failed", p.id, err);
          return { id: p.id, reason: "" };
        }
      }),
    );

    return { reasons: results, error: null };
  });
