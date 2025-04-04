"use server";

import OpenAI from "openai";
import { z } from "zod";
import { ORIENTATION_CONFIGS } from "../config/image-configs";

const generateAdSchema = z.object({
  image: z.string(),
  prompt: z.string().min(1),
  removeBackground: z.boolean(),
  orientation: z.enum(["square", "portrait", "landscape"]),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAd(
  prevState: { error?: string; imageUrl?: string; textImageUrl?: string },
  formData: FormData,
) {
  try {
    const image = formData.get("image");
    const prompt = formData.get("prompt");
    const removeBackground = formData.get("removeBackground");
    const orientation = formData.get("orientation") || "square";

    if (!image || !prompt) {
      throw new Error("Missing required fields");
    }

    const validatedData = generateAdSchema.parse({
      image: image.toString(),
      prompt: prompt.toString(),
      removeBackground: removeBackground === "true",
      orientation: orientation.toString() as
        | "square"
        | "portrait"
        | "landscape",
    });

    // Single GPT-4V call to generate both image and text
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Create a professional advertisement based on this product image and the following requirements:

${validatedData.prompt}

Please provide TWO things in your response:
1. A URL for a professional product photo that matches the style and requirements above
2. Compelling advertising copy that would work well with the image

Format your response EXACTLY like this:
IMAGE_URL: [the URL for the professional product photo]
TEXT: [the advertising copy]`,
            },
            {
              type: "image_url",
              image_url: {
                url: validatedData.image,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content || "";

    console.log(response.choices[0]?.message);

    // Parse the response to extract image URL and text
    const imageUrlMatch = content.match(/IMAGE_URL:\s*(.+?)(?:\n|$)/);
    const textMatch = content.match(/TEXT:\s*(.+?)(?:\n|$)/);

    const imageUrl = imageUrlMatch?.[1]?.trim() || null;
    const textOverlay = textMatch?.[1]?.trim() || null;

    if (!imageUrl) {
      throw new Error("Failed to generate image URL");
    }

    return {
      imageUrl,
      textImageUrl: textOverlay,
    };
  } catch (error) {
    console.error("Error generating ad:", error);
    return { error: "Failed to generate ad. Please try again." };
  }
}
