export interface Anime {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    extraLarge: string;
    color: string | null;
  };
  genres: string[];
  averageScore: number | null;
  episodes: number | null;
  status: string;
}

const ANILIST_API = "https://graphql.anilist.co";

const HOME_QUERY = `
  query HomeAnime {
    trending: Page(page: 1, perPage: 12) {
      media(type: ANIME, status: RELEASING, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          color
        }
        genres
        averageScore
        episodes
        status
      }
    }
  }
`;

const FALLBACK_ANIME: Anime[] = [
  {
    id: 16498,
    title: {
      romaji: "Shingeki no Kyojin",
      english: "Attack on Titan",
      native: "進撃の巨人",
    },
    coverImage: {
      extraLarge:
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6FPmWm59CyP.jpg",
      color: "#e4a15d",
    },
    genres: ["Action", "Drama"],
    averageScore: 84,
    episodes: 25,
    status: "FINISHED",
  },
  {
    id: 1535,
    title: {
      romaji: "DEATH NOTE",
      english: "Death Note",
      native: "DEATH NOTE",
    },
    coverImage: {
      extraLarge:
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-4r88a1tsBEIz.jpg",
      color: "#5d5d5d",
    },
    genres: ["Mystery", "Psychological"],
    averageScore: 84,
    episodes: 37,
    status: "FINISHED",
  },
  {
    id: 21459,
    title: {
      romaji: "Boku no Hero Academia",
      english: "My Hero Academia",
      native: "僕のヒーローアカデミア",
    },
    coverImage: {
      extraLarge:
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-DUKLgasrgeNO.jpg",
      color: "#e4b45d",
    },
    genres: ["Action", "Adventure"],
    averageScore: 77,
    episodes: 13,
    status: "FINISHED",
  },
];

export async function getTrendingAnime(): Promise<Anime[]> {
  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "AniSOL/1.0",
      },
      body: JSON.stringify({
        query: HOME_QUERY,
      }),
      next: {
        revalidate: 3600,
      },
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      console.error("AniList response body:", rawResponse);
      throw new Error(
        `AniList request failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = JSON.parse(rawResponse);

    if (result.errors?.length) {
      throw new Error(
        result.errors
          .map((error: { message: string }) => error.message)
          .join(", "),
      );
    }

    return result.data?.trending?.media ?? [];
  } catch (error) {
    console.warn("AniList unavailable; using fallback data:", error);
    return FALLBACK_ANIME;
  }
}