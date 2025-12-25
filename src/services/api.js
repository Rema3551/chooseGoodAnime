const BASE_URL = 'https://api.jikan.moe/v4';

/**
 * Delays execution for a specified amount of time to avoid rate limiting.
 * Jikan API has strict rate limits (3 requests/second, 60 requests/minute).
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getTopAnime = async (page = 1, filter = '') => {
    try {
        let url = `${BASE_URL}/top/anime?page=${page}`;
        if (filter) {
            url += `&filter=${filter}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 429) {
                console.warn('Rate limit reached, waiting...');
                await delay(1000);
                // Simple retry logic could be added here
                throw new Error('Rate limit reached. Please try again in a moment.');
            }
            throw new Error('Failed to fetch top anime');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching top anime:', error);
        throw error;
    }
};

export const searchAnime = async (query = '', filters = {}) => {
    try {
        let url = `${BASE_URL}/anime?q=${encodeURIComponent(query)}`;

        // Add filters to URL
        if (filters.genres && filters.genres.length > 0) {
            url += `&genres=${filters.genres.join(',')}`;
        }
        if (filters.producers && filters.producers.length > 0) {
            url += `&producers=${filters.producers.join(',')}`;
        }
        if (filters.min_score) {
            url += `&min_score=${filters.min_score}`;
        }
        if (filters.status) {
            url += `&status=${filters.status}`;
        }
        if (filters.start_date) {
            url += `&start_date=${filters.start_date}-01-01`;
        }
        if (filters.type) {
            url += `&type=${filters.type}`;
        }
        if (filters.page) {
            url += `&page=${filters.page}`;
        }

        // Default sorting
        if (!query && !filters.order_by) {
            url += '&order_by=popularity&sort=asc';
        } else if (filters.order_by) {
            url += `&order_by=${filters.order_by}&sort=desc`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching anime:', error);
        throw error;
    }
};

export const getAnimeStreaming = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/anime/${id}/streaming`);
        if (!response.ok) throw new Error('Failed to fetch streaming links');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching streaming links:', error);
        return [];
    }
};



import { KEYWORD_TO_TAG } from './keyword_map.js';

// ... (existing exports)

// Known AniList Genres (must be exact casing)
const ANILIST_GENRES = [
    "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror",
    "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance",
    "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"
];

/**
 * Searches AniList with a specific list of tags AND genres.
 */
export const searchAnimeByTags = async (tags, genres = [], page = 1, excludeIds = []) => {
    try {
        if ((!tags || tags.length === 0) && (!genres || genres.length === 0)) {
            return { data: [], pagination: { has_next_page: false } };
        }



        const query = `
        query ($tags: [String], $genres: [String], $page: Int, $excludeIds: [Int]) {
          Page(page: $page, perPage: 20) {
            pageInfo {
              hasNextPage
            }
            media(tag_in: $tags, genre_in: $genres, id_not_in: $excludeIds, type: ANIME, sort: POPULARITY_DESC) {
              id
              idMal
              title {
                romaji
                english
              }
              coverImage {
                extraLarge
                large
              }
              averageScore
              genres
              seasonYear
              description
              tags {
                  name
                  rank
              }
            }
          }
        }
        `;

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: {
                    tags: tags.length > 0 ? tags : undefined,
                    genres: genres && genres.length > 0 ? genres : undefined, // Pass genres if present
                    page: page,
                    excludeIds: excludeIds
                }
            })
        });

        const data = await response.json();
        const aniListResults = data.data?.Page?.media || [];
        const hasNextPage = data.data?.Page?.pageInfo?.hasNextPage || false;

        const mappedResults = aniListResults.map(item => ({
            mal_id: item.idMal || item.id,
            title: item.title.english || item.title.romaji,
            images: {
                jpg: {
                    large_image_url: item.coverImage.extraLarge || item.coverImage.large,
                    image_url: item.coverImage.large
                },
                webp: {
                    large_image_url: item.coverImage.extraLarge || item.coverImage.large,
                    image_url: item.coverImage.large
                }
            },
            score: item.averageScore ? (item.averageScore / 10).toFixed(2) : 'N/A',
            genres: item.genres.map(g => ({ name: g })),
            year: item.seasonYear,
            synopsis: item.description,
            producers: [],
            tags: item.tags || [] // Include tags for mixer explanation
        }));

        return {
            data: mappedResults,
            pagination: { has_next_page: hasNextPage }
        };

    } catch (error) {
        console.error('Error searching AniList by tags:', error);
        return { data: [], pagination: { has_next_page: false } };
    }
};

/**
 * Parses a descriptive query, extracts keywords, and searches AniList by Tags.
 * Maps results to Jikan-like format.
 */
export const searchAniList = async (descriptionQuery, page = 1) => {
    try {
        // 1. Extract Keywords & Map to Tags

        // Pre-processing for phrases (convert to single tokens)
        let processedQuery = descriptionQuery.toLowerCase();
        processedQuery = processedQuery.replace(/beau gosse/g, "beaugosse");
        processedQuery = processedQuery.replace(/jeux? de sociét[ée]/g, "jeudesociete"); // Handle singular/plural and accent
        processedQuery = processedQuery.replace(/feel good/g, "iyashikei");
        processedQuery = processedQuery.replace(/school life/g, "school");

        // Normalize accents: "Drôle" -> "drole", "Épique" -> "epique"
        const normalizedQuery = processedQuery
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Split by spaces and common punctuation
        const words = normalizedQuery.split(/[\s,.;:!?]+/);
        const foundTerms = [];

        words.forEach(w => {
            // Remove remaining special chars just in case
            const cleanWord = w.replace(/[^a-z0-9-]/g, "");

            // Check direct match
            if (KEYWORD_TO_TAG[cleanWord]) {
                foundTerms.push(KEYWORD_TO_TAG[cleanWord]);
            }
            // Handle Plurals (French: usually ends in 's', rarely 'x')
            else if (cleanWord.endsWith('s') && KEYWORD_TO_TAG[cleanWord.slice(0, -1)]) {
                foundTerms.push(KEYWORD_TO_TAG[cleanWord.slice(0, -1)]);
            }
            else if (cleanWord.endsWith('x') && KEYWORD_TO_TAG[cleanWord.slice(0, -1)]) {
                foundTerms.push(KEYWORD_TO_TAG[cleanWord.slice(0, -1)]);
            }
        });

        // Deduplicate
        const uniqueTerms = [...new Set(foundTerms)];

        if (uniqueTerms.length === 0) {
            // No tags found, return empty or fallback?
            // Let's return empty and let UI handle "No vibe found"
            return { data: [], pagination: { has_next_page: false } };
        }

        // Split into Genres and Tags
        const genres = uniqueTerms.filter(t => ANILIST_GENRES.includes(t));
        const tags = uniqueTerms.filter(t => !ANILIST_GENRES.includes(t));

        const searchResult = await searchAnimeByTags(tags, genres, page);

        // Attach the used filters to the response so UI can display them
        return {
            ...searchResult,
            meta: {
                recognizedTags: tags,
                recognizedGenres: genres
            }
        };

    } catch (error) {
        console.error('Error searching AniList:', error);
        return { data: [], pagination: { has_next_page: false } };
    }
};

export const getAnimeRecommendations = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/anime/${id}/recommendations`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        const data = await response.json();
        // Recommendations format from Jikan is { entry: { mal_id, title, ... }, votes: number }
        // We need to map it to our anime card format
        const recs = data.data || [];
        return recs.map(r => ({
            mal_id: r.entry.mal_id,
            title: r.entry.title,
            images: {
                jpg: {
                    large_image_url: r.entry.images?.jpg?.large_image_url || r.entry.images?.jpg?.image_url,
                    image_url: r.entry.images?.jpg?.image_url
                }
            },
            score: null, // Recommendations endpoint often doesn't give score directly
            genres: [],   // Same for genres
            year: null,   // Same for year
            // We might need to fetch details for each if we want full data, but that's too heavy.
            // Let's display basic info.
        }));
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
};

/**
 * Fetches high-res banner image from AniList by title.
 */
export const getAniListHighResImage = async (title) => {
    try {
        const query = `
        query ($search: String) {
          Media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            bannerImage
            coverImage {
              extraLarge
              large
            }
          }
        }
        `;

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { search: title }
            })
        });

        const data = await response.json();
        const media = data.data?.Media;

        if (media && media.bannerImage) {
            return media.bannerImage;
        }
        return null;
    } catch (error) {
        console.error('Error fetching AniList image:', error);
        return null;
    }
};

const getAnimeById = async (id) => {
    try {
        await delay(350); // Rate limit protection
        const response = await fetch(`${BASE_URL}/anime/${id}`);
        if (!response.ok) {
            if (response.status === 429) {
                console.warn(`Rate limit reached for ID ${id}, waiting...`);
                await delay(1000);
                return getAnimeById(id); // Retry once
            }
            throw new Error(`Failed to fetch anime ${id}`);
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching anime ${id}:`, error);
        return null;
    }
};

export { getAnimeById };

export const getAnimeGenres = async () => {
    try {
        const response = await fetch(`${BASE_URL}/genres/anime`);
        if (!response.ok) throw new Error('Failed to fetch genres');
        const data = await response.json();
        return data.data; // Jikan returns { data: [...] }
    } catch (error) {
        console.error('Error fetching genres', error);
        return [];
    }
}
