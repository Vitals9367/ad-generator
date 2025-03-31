import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// Contact request input validation schema
const createContactRequestInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

// Create contact request route
const createContactRequestRoute = publicProcedure
  .input(createContactRequestInput)
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.contactRequest.create({
      data: {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
      },
    });
  });

// Create and export the router with all routes
export const contactRouter = createTRPCRouter({
  create: createContactRequestRoute,
});
