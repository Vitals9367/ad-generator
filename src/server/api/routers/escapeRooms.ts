import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  fetchRoomByNameInput,
  fetchCitiesByCountryInput,
  fetchBestRoomsByCountryInput,
  fetchBestRoomsByCountryAndCityInput,
  searchRoomsInput,
  similarRoomsInput,
} from "@/server/api/dto/escapeRoomDTO";
import {
  fetchRoomByName,
  fetchRooms,
  fetchAllCountries,
  fetchAllCountriesAndCities,
  fetchCitiesByCountry,
  fetchBestRoomsByCountry,
  fetchBestRoomsByCountryAndCity,
  fetchTerpecaAwardRooms,
  fetchAllTerpecaAwardRooms,
  searchRooms,
  fetchAllSearchCriteriaValues,
  findSimilarRooms,
} from "@/server/api/services/escapeRoomService";

// Room fetching routes
/**
 * Fetches a specific escape room by its name, city, and country
 * @param input - Object containing name, city, and country
 * @returns The matching escape room or null if not found
 */
const fetchRoomByNameRoute = publicProcedure
  .input(fetchRoomByNameInput)
  .query(async ({ ctx, input }) => await fetchRoomByName(ctx.db, input));

/**
 * Fetches all escape rooms in the database
 * @returns Array of all escape rooms
 */
const fetchRoomsRoute = publicProcedure.query(
  async ({ ctx }) => await fetchRooms(ctx.db),
);

// Location routes
/**
 * Fetches all countries that have escape rooms
 * @returns Array of unique country names
 */
const fetchAllCountriesRoute = publicProcedure.query(
  async ({ ctx }) => await fetchAllCountries(ctx.db),
);

/**
 * Fetches all countries and their corresponding cities that have escape rooms
 * @returns Object mapping countries to arrays of their cities
 */
const fetchAllCountriesAndCitiesRoute = publicProcedure.query(
  async ({ ctx }) => await fetchAllCountriesAndCities(ctx.db),
);

/**
 * Fetches all cities in a specific country that have escape rooms
 * @param input - Object containing the country name
 * @returns Array of city names in the specified country
 */
const fetchCitiesByCountryRoute = publicProcedure
  .input(fetchCitiesByCountryInput)
  .query(async ({ ctx, input }) => await fetchCitiesByCountry(ctx.db, input));

// Best rooms routes
/**
 * Fetches the top-rated escape rooms in a specific country
 * @param input - Object containing the country name
 * @returns Array of the best-rated escape rooms in the country
 */
const fetchBestRoomsByCountryRoute = publicProcedure
  .input(fetchBestRoomsByCountryInput)
  .query(
    async ({ ctx, input }) => await fetchBestRoomsByCountry(ctx.db, input),
  );

/**
 * Fetches the top-rated escape rooms in a specific city
 * @param input - Object containing the country and city names
 * @returns Array of the best-rated escape rooms in the city
 */
const fetchBestRoomsByCountryAndCityRoute = publicProcedure
  .input(fetchBestRoomsByCountryAndCityInput)
  .query(
    async ({ ctx, input }) =>
      await fetchBestRoomsByCountryAndCity(ctx.db, input),
  );

// Award routes
/**
 * Fetches escape rooms that have won TERPECA awards
 * Limited to the most recent winners
 * @returns Array of award-winning escape rooms
 */
const fetchTerpecaAwardRoomsRoute = publicProcedure.query(
  async ({ ctx }) => await fetchTerpecaAwardRooms(ctx.db),
);

/**
 * Fetches all escape rooms that have ever won TERPECA awards
 * @returns Array of all TERPECA award-winning escape rooms
 */
const fetchAllTerpecaAwardRoomsRoute = publicProcedure.query(
  async ({ ctx }) => await fetchAllTerpecaAwardRooms(ctx.db),
);

// Search routes
/**
 * Searches for escape rooms based on various criteria
 * @param input - Search parameters including location, difficulty, category, etc.
 * @returns Object containing search results, pagination info, and total count
 */
const searchRoomsRoute = publicProcedure
  .input(searchRoomsInput)
  .query(async ({ ctx, input }) => await searchRooms(ctx.db, input));

/**
 * Fetches all possible values for search criteria
 * Includes categories, puzzle types, scare factors, player counts, etc.
 * @returns Object containing all possible filter values
 */
const fetchAllSearchCriteriaValuesRoute = publicProcedure.query(
  async ({ ctx }) => await fetchAllSearchCriteriaValues(ctx.db),
);

// Recommendation routes
/**
 * Finds similar escape rooms based on various criteria
 * Considers factors like location, categories, and ratings
 * @param input - Object containing roomId and optional limit
 * @returns Array of similar escape rooms
 */
const findSimilarRoomsRoute = publicProcedure
  .input(similarRoomsInput)
  .query(
    async ({ ctx, input }) =>
      await findSimilarRooms(ctx.db, input.roomId, input.limit),
  );

// Create and export the router with all routes
export const escapeRoomsRouter = createTRPCRouter({
  // Room fetching routes
  fetchRoomByName: fetchRoomByNameRoute,
  fetchRooms: fetchRoomsRoute,

  // Location routes
  fetchAllCountries: fetchAllCountriesRoute,
  fetchAllCountriesAndCities: fetchAllCountriesAndCitiesRoute,
  fetchCitiesByCountry: fetchCitiesByCountryRoute,

  // Best rooms routes
  fetchBestRoomsByCountry: fetchBestRoomsByCountryRoute,
  fetchBestRoomsByCountryAndCity: fetchBestRoomsByCountryAndCityRoute,

  // Award routes
  fetchTerpecaAwardRooms: fetchTerpecaAwardRoomsRoute,
  fetchAllTerpecaAwardRooms: fetchAllTerpecaAwardRoomsRoute,

  // Search routes
  searchRooms: searchRoomsRoute,
  fetchAllSearchCriteriaValues: fetchAllSearchCriteriaValuesRoute,

  // Recommendation routes
  findSimilarRooms: findSimilarRoomsRoute,
});
