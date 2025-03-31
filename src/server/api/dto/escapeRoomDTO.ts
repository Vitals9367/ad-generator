import { z } from "zod";

export const fetchRoomByNameInput = z.object({
  country: z.string(),
  city: z.string(),
  name: z.string(),
});

export const fetchCitiesByCountryInput = z.object({
  country: z.string(),
});

export const fetchBestRoomsByCountryInput = z.object({
  country: z.string().nonempty("Country is required"),
});

export const fetchBestRoomsByCountryAndCityInput = z.object({
  country: z.string().nonempty("Country is required"),
  city: z.string().nonempty("City is required"),
});

export const searchRoomsInput = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  name: z.string().optional(),
  rating: z.number().optional(),
  difficulty: z.string().optional(),
  category: z.string().optional(),
  minAge: z.number().optional(),
  minPlayers: z.number().optional(),
  maxPlayers: z.number().optional(),
  puzzleType: z.string().optional(),
  scareFactor: z.number().optional(),
  orderBy: z
    .object({
      field: z.string(),
      direction: z.enum(["asc", "desc"]),
    })
    .optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const similarRoomsInput = z.object({
  roomId: z.string(),
  limit: z.number().min(1).max(20).optional().default(10),
});
