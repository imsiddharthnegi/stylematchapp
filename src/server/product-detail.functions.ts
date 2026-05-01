import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().nullable().optional(),
    price: z.number(),
  }),
  preferences: z
    .object({
      vibe: z.string().nullable().optional(),
      colors: z.array(z.string()).optional(),
      priceRange: z.tuple([z.number(), z.number()]).optional(),
      fit: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const generateProductPickReason = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{ reason: string; error: string | null }> => {
      const apiKey = process.env.LOVABLE_API_KEY;
      if (!apiKey) {
        return { reason: "", error: "AI service not configured" };
      }

      const { product, preferences } = data;
      const prefSummary = preferences
        ? [
            preferences.vibe ? `${preferences.vibe} vibe` : null,
            preferences.colors?.length
              ? `colors: ${preferences.colors.join(", ")}`
              : null,
            preferences.priceRange
              ? `budget $${preferences.priceRange[0]}-$${preferences.priceRange[1]}`
              : null,
            preferences.fit ? `${preferences.fit} fit` : null,
          ]
            .filter(Boolean)
            .join("; ")
        : "";

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
                  "You are a thoughtful fashion stylist. Reply in 2 short sentences (max 40 words total) explaining why this piece is a strong pick. Focus on fabric, silhouette, palette, or styling potential. No quotes, no preamble.",
              },
              {
                role: "user",
                content: `${prefSummary ? `User style: ${prefSummary}.` : "No quiz taken yet — speak to the piece itself."} Product: ${product.name}, ${product.category ?? "apparel"}, $${product.price}. Why is this a smart pick?`,
              },
            ],
            max_tokens: 140,
            temperature: 0.7,
          }),
        });

        if (res.status === 429) {
          return { reason: "", error: "Rate limit reached. Try again shortly." };
        }
        if (res.status === 402) {
          return { reason: "", error: "AI credits exhausted." };
        }
        if (!res.ok) {
          console.error(`AI gateway ${res.status} for product ${product.id}`);
          return { reason: "", error: "AI service error" };
        }

        const json = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const reason = json.choices?.[0]?.message?.content?.trim() ?? "";
        return {
          reason: reason.replace(/^["']|["']$/g, ""),
          error: null,
        };
      } catch (err) {
        console.error("AI pick reason failed", product.id, err);
        return { reason: "", error: "AI service unavailable" };
      }
    },
  );
