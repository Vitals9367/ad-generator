"use server";

import { db } from "@/server/db";
import { headers } from "next/headers";

interface FeedbackData {
  type: "positive" | "negative";
  message: string;
  escapeRoomId?: string;
}

export async function submitFeedback(data: FeedbackData) {
  try {
    const headersList = await headers();
    const metadata = {
      userAgent: String(headersList.get("user-agent")),
      referer: String(headersList.get("referer")),
      submittedAt: new Date().toISOString(),
    };

    await db.feedback.create({
      data: {
        type: data.type === "positive" ? "POSITIVE" : "NEGATIVE",
        message: data.message,
        escapeRoomId: data.escapeRoomId ?? null,
        metadata,
        status: "PENDING",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}
