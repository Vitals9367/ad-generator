import { type PrismaClient, Prisma } from "@prisma/client";
import { type z } from "zod";
import {
  type fetchRoomByNameInput,
  type fetchCitiesByCountryInput,
  type searchRoomsInput,
  type fetchBestRoomsByCountryAndCityInput,
  type fetchBestRoomsByCountryInput,
} from "@/server/api/dto/escapeRoomDTO";

// Type definitions
type CriteriaValues = Record<string, string[]>;
type CategoryMapping = typeof categoryMapping;
type PuzzleTypeMapping = typeof puzzleTypeMapping;

// Constants
const categoryMapping = {
  Horror: "HORROR",
  Adventure: "ADVENTURE",
  "Sci-Fi": "SCI_FI",
  Detective: "DETECTIVE",
  Historical: "HISTORICAL",
  Fantasy: "FANTASY",
  Action: "ACTION",
  Mystery: "MYSTERY",
  Adult: "ADULT",
} as const;

const puzzleTypeMapping = {
  Logic: "LOGIC",
  Math: "MATH",
  Physical: "PHYSICAL",
  Search: "SEARCH",
  Memory: "MEMORY",
  "Pattern Recognition": "PATTERN_RECOGNITION",
  Riddle: "RIDDLE",
} as const;

/**
 * Fetch a room by name, city and country
 */
export async function fetchRoomByName(
  db: PrismaClient,
  input: z.infer<typeof fetchRoomByNameInput>,
) {
  return await db.escapeRooms.findFirst({
    where: {
      country: {
        contains: input.country,
        mode: "insensitive",
      },
      city: {
        contains: input.city,
        mode: "insensitive",
      },
      name: {
        contains: input.name,
        mode: "insensitive",
      },
    },
  });
}

/**
 * Fetch all escape rooms
 */
export async function fetchRooms(db: PrismaClient) {
  return await db.escapeRooms.findMany();
}

/**
 * Fetch all countries that have escape rooms
 */
export async function fetchAllCountries(db: PrismaClient) {
  const countries = await db.escapeRooms.findMany({
    select: {
      country: true,
    },
    distinct: ["country"],
  });

  return countries.map((c) => c.country);
}

/**
 * Fetch all countries and their cities that have escape rooms
 */
export async function fetchAllCountriesAndCities(db: PrismaClient) {
  const countryAndCities = await db.escapeRooms.findMany({
    select: {
      country: true,
      city: true,
    },
    distinct: ["country", "city"],
  });

  const criteriaValues: CriteriaValues = {};

  countryAndCities.forEach(({ country, city }) => {
    if (country && city && country.trim() !== "" && city.trim() !== "") {
      if (!criteriaValues[country]) {
        criteriaValues[country] = [];
      }
      if (!criteriaValues[country].includes(city)) {
        criteriaValues[country].push(city);
      }
    }
  });

  return criteriaValues;
}

/**
 * Fetch cities by country
 */
export async function fetchCitiesByCountry(
  db: PrismaClient,
  input: z.infer<typeof fetchCitiesByCountryInput>,
) {
  return await db.escapeRooms.findMany({
    where: {
      country: {
        equals: input.country,
        mode: "insensitive",
      },
    },
    select: {
      city: true,
    },
    distinct: ["city"],
  });
}

/**
 * Fetch best rated rooms by country
 */
export async function fetchBestRoomsByCountry(
  db: PrismaClient,
  input: z.infer<typeof fetchBestRoomsByCountryInput>,
) {
  return await db.escapeRooms.findMany({
    where: {
      country: {
        equals: input.country,
        mode: "insensitive",
      },
    },
    orderBy: {
      rating: "desc",
    },
    take: 4,
  });
}

/**
 * Fetch best rated rooms by country and city
 */
export async function fetchBestRoomsByCountryAndCity(
  db: PrismaClient,
  input: z.infer<typeof fetchBestRoomsByCountryAndCityInput>,
) {
  return await db.escapeRooms.findMany({
    where: {
      country: {
        equals: input.country,
        mode: "insensitive",
      },
      city: {
        equals: input.city,
        mode: "insensitive",
      },
    },
    orderBy: {
      rating: "desc",
    },
    take: 4,
  });
}

/**
 * Build search query filters
 */
function buildSearchFilters(input: z.infer<typeof searchRoomsInput>) {
  const where: Record<string, unknown> = {};

  if (input.country) {
    where.country = {
      contains: input.country,
      mode: "insensitive",
    };
  }

  if (input.city) {
    where.city = {
      contains: input.city,
      mode: "insensitive",
    };
  }

  if (input.name) {
    where.name = {
      contains: input.name,
      mode: "insensitive",
    };
  }

  if (input.rating) {
    where.rating = {
      gte: input.rating,
    };
  }

  if (input.difficulty) {
    where.difficulty = {
      equals: input.difficulty,
      mode: "insensitive",
    };
  }

  if (input.category) {
    where.categories = {
      contains: input.category,
      mode: "insensitive",
    };
  }

  if (input.minAge) {
    where.minimumAge = {
      gte: input.minAge,
    };
  }

  if (input.minPlayers || input.maxPlayers) {
    const playerCountFilter: Record<string, unknown> = {};

    if (input.minPlayers) {
      playerCountFilter.minPlayerCount = {
        gte: input.minPlayers,
      };
    }

    if (input.maxPlayers) {
      playerCountFilter.maxPlayerCount = {
        lte: input.maxPlayers,
      };
    }

    const existingAnd = Array.isArray(where.AND) ? where.AND : [];
    where.AND = [...existingAnd, playerCountFilter];
  }

  if (input.puzzleType) {
    where.puzzleTypes = {
      has: input.puzzleType,
    };
  }

  if (input.scareFactor) {
    where.scareFactor = {
      gte: input.scareFactor,
    };
  }

  return where;
}

/**
 * Search rooms with various filters and pagination
 */
export async function searchRooms(
  db: PrismaClient,
  input: z.infer<typeof searchRoomsInput>,
) {
  const where = buildSearchFilters(input);
  const orderBy = input.orderBy
    ? {
        [input.orderBy.field]: {
          sort: Prisma.SortOrder.desc,
          nulls: Prisma.NullsOrder.last,
        },
      }
    : [
        {
          rating: {
            sort: Prisma.SortOrder.desc,
            nulls: Prisma.NullsOrder.last,
          },
        },
        {
          reviews_count: {
            sort: Prisma.SortOrder.desc,
            nulls: Prisma.NullsOrder.last,
          },
        },
      ];

  const page = input.page ?? 1;
  const limit = input.limit ?? 10;
  const skip = (page - 1) * limit;

  const [results, totalCount] = await Promise.all([
    db.escapeRooms.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    db.escapeRooms.count({ where }),
  ]);

  const nextPage = skip + limit < totalCount ? page + 1 : null;

  return {
    results,
    nextPage,
    totalCount,
  };
}

/**
 * Fetch all search criteria values for filtering
 */
export async function fetchAllSearchCriteriaValues(db: PrismaClient) {
  const countryAndCities = await fetchAllCountriesAndCities(db);

  const sortedValues = {
    categories: {
      displayNames: Object.keys(categoryMapping),
      values: Object.values(categoryMapping),
    },
    puzzleTypes: {
      displayNames: Object.keys(puzzleTypeMapping),
      values: Object.values(puzzleTypeMapping),
    },
    scareFactors: [1, 2, 3, 4, 5],
    minPlayerCounts: [1, 2, 3, 4],
    maxPlayerCounts: [4, 6, 8, 10, 12],
    priceRanges: [1, 2, 3, 4, 5],
    minAges: [6, 8, 10, 12, 14, 16, 18],
    maxAges: [99],
  };

  return {
    countries: Object.keys(countryAndCities).filter(Boolean),
    cities: countryAndCities,
    ...sortedValues,
  };
}

/**
 * Fetch rooms that won TERPECA awards (featured)
 */
export async function fetchTerpecaAwardRooms(db: PrismaClient, limit = 8) {
  return await db.escapeRooms.findMany({
    where: {
      isTerpecaWinner: true,
      terpecaAwardYears: {
        isEmpty: false,
      },
    },
    orderBy: [
      {
        terpecaAwardYears: "desc",
      },
      {
        rating: "desc",
      },
    ],
    take: limit,
  });
}

/**
 * Fetch all rooms that won TERPECA awards
 */
export async function fetchAllTerpecaAwardRooms(db: PrismaClient) {
  return await db.escapeRooms.findMany({
    where: {
      isTerpecaWinner: true,
      terpecaAwardYears: {
        isEmpty: false,
      },
    },
    orderBy: [
      {
        terpecaAwardYears: "desc",
      },
      {
        rating: "desc",
      },
    ],
  });
}

/**
 * Fetch all unique categories across all rooms
 */
export async function fetchAllCategories(db: PrismaClient) {
  const categoriesArray = await db.escapeRooms.findMany({
    select: {
      categories: true,
    },
  });

  return Array.from(
    new Set(categoriesArray.flatMap((room) => room.categories || [])),
  )
    .filter(Boolean)
    .sort();
}

/**
 * Fetch all countries, cities, and their categories
 */
export async function fetchAllCountriesAndCitiesWithCategories(
  db: PrismaClient,
) {
  const rooms = await db.escapeRooms.findMany({
    select: {
      country: true,
      city: true,
      categories: true,
    },
  });

  const result: Record<string, Record<string, string[]>> = {};

  rooms.forEach(({ country, city, categories }) => {
    if (!country || !city || !categories || categories.length === 0) return;

    if (!result[country]) {
      result[country] = {};
    }

    if (!result[country]?.[city]) {
      result[country][city] = [];
    }

    categories.forEach((category) => {
      if (category && !result[country]?.[city]?.includes(category)) {
        result[country]![city]!.push(category);
      }
    });
  });

  return result;
}

/**
 * Fetch categories by country
 */
export async function fetchCategoriesByCountry(
  db: PrismaClient,
  country: string,
) {
  const rooms = await db.escapeRooms.findMany({
    where: {
      country: {
        equals: country,
        mode: "insensitive",
      },
    },
    select: {
      categories: true,
    },
  });

  return Array.from(new Set(rooms.flatMap((room) => room.categories || [])))
    .filter(Boolean)
    .sort();
}

/**
 * Fetch categories by country and city
 */
export async function fetchCategoriesByCountryAndCity(
  db: PrismaClient,
  country: string,
  city: string,
) {
  const rooms = await db.escapeRooms.findMany({
    where: {
      country: {
        equals: country,
        mode: "insensitive",
      },
      city: {
        equals: city,
        mode: "insensitive",
      },
    },
    select: {
      categories: true,
    },
  });

  return Array.from(new Set(rooms.flatMap((room) => room.categories || [])))
    .filter(Boolean)
    .sort();
}

/**
 * Find similar escape rooms to a given room
 */
export async function findSimilarRooms(
  db: PrismaClient,
  roomId: string,
  limit = 10,
) {
  const sourceRoom = await db.escapeRooms.findUnique({
    where: { place_id: roomId },
  });

  if (!sourceRoom) {
    throw new Error(`Room with ID ${roomId} not found`);
  }

  const sameCitySimilarRooms = await db.escapeRooms.findMany({
    where: {
      place_id: { not: roomId },
      city: sourceRoom.city,
      country: sourceRoom.country,
      categories: {
        hasSome: sourceRoom.categories,
      },
    },
    orderBy: [{ rating: "desc" }, { reviews_count: "desc" }],
    take: limit,
  });

  if (sameCitySimilarRooms.length >= limit) {
    return sameCitySimilarRooms;
  }

  const sameCountrySimilarRooms = await db.escapeRooms.findMany({
    where: {
      place_id: { not: roomId },
      city: { not: sourceRoom.city },
      country: sourceRoom.country,
      categories: {
        hasSome: sourceRoom.categories,
      },
    },
    orderBy: [{ rating: "desc" }, { reviews_count: "desc" }],
    take: limit - sameCitySimilarRooms.length,
  });

  let similarRooms = [...sameCitySimilarRooms, ...sameCountrySimilarRooms];

  if (similarRooms.length < limit) {
    const excludeIds = [...similarRooms.map((room) => room.place_id), roomId];

    const topRatedCityRooms = await db.escapeRooms.findMany({
      where: {
        place_id: { notIn: excludeIds },
        city: sourceRoom.city,
        country: sourceRoom.country,
      },
      orderBy: [{ rating: "desc" }, { reviews_count: "desc" }],
      take: limit - similarRooms.length,
    });

    similarRooms = [...similarRooms, ...topRatedCityRooms];
  }

  if (similarRooms.length < limit) {
    const excludeIds = [...similarRooms.map((room) => room.place_id), roomId];

    const topRatedCountryRooms = await db.escapeRooms.findMany({
      where: {
        place_id: { notIn: excludeIds },
        country: sourceRoom.country,
      },
      orderBy: [{ rating: "desc" }, { reviews_count: "desc" }],
      take: limit - similarRooms.length,
    });

    similarRooms = [...similarRooms, ...topRatedCountryRooms];
  }

  return similarRooms;
}
