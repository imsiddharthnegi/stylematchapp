import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Message = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const Input = z.object({
  messages: z.array(Message).min(1).max(20),
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

export const askStylist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<{ reply: string; error: string | null }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "", error: "AI service not configured" };
    }

    const { preferences, messages } = data;
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

    const systemPrompt = `You are StyleMatch's in-app AI Stylist. You give warm, expert, concise wardrobe advice in 2-4 short sentences. No bullet lists, no markdown. ${
      prefSummary ? `User's saved style profile: ${prefSummary}.` : ""
    }`;

    try {
      const res = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          max_tokens: 220,
          temperature: 0.8,
        }),
      });

      if (res.status === 429) {
        return { reply: "", error: "Too many requests — try again in a moment." };
      }
      if (res.status === 402) {
        return { reply: "", error: "AI credits exhausted. Add credits in workspace settings." };
      }
      if (!res.ok) {
        return { reply: "", error: `AI service error (${res.status})` };
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
      return { reply, error: null };
    } catch (err) {
      console.error("askStylist failed", err);
      return { reply: "", error: "Network error reaching the stylist." };
    }
  });
