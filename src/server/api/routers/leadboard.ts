import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// Leaderboard entry input validation schema
const createLeaderboardEntryInput = z.object({
  place_id: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Team name is required"),
  email: z.string().email("Invalid email address"),
  minutes: z.number().min(0, "Minutes must be greater than 0"),
  seconds: z.number().min(0, "Seconds must be greater than 0").max(59),
});

// Create leaderboard entry route
const createLeaderboardEntryRoute = publicProcedure
  .input(createLeaderboardEntryInput)
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.leaderboardEntry.create({
      data: {
        place_id: input.place_id,
        name: input.name,
        email: input.email,
        minutes: input.minutes,
        seconds: input.seconds,
      },
    });
  });

// Get leaderboard entries for a room route
const getRoomLeaderboardRoute = publicProcedure
  .input(
    z.object({
      place_id: z.string().min(1, "Room ID is required"),
      limit: z.number().min(1).max(100).default(10),
    }),
  )
  .query(async ({ ctx, input }) => {
    return await ctx.db.leaderboardEntry.findMany({
      where: {
        place_id: input.place_id,
      },
      take: input.limit,
      orderBy: [
        {
          minutes: "asc",
        },
        {
          seconds: "asc",
        },
      ],
    });
  });

export const leaderboardRouter = createTRPCRouter({
  create: createLeaderboardEntryRoute,
  getRoomLeaderboard: getRoomLeaderboardRoute,
});
