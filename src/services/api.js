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

/**
 * Searches AniList with a specific list of tags.
 */
export const searchAnimeByTags = async (tags, page = 1, excludeIds = []) => {
    try {
        if (!tags || tags.length === 0) {
            return { data: [], pagination: { has_next_page: false } };
        }

        console.log(`Searching AniList with tags: ${tags.join(', ')} (Page ${page})`);

        const query = `
        query ($tags: [String], $page: Int, $excludeIds: [Int]) {
          Page(page: $page, perPage: 20) {
            pageInfo {
              hasNextPage
            }
            media(tag_in: $tags, id_not_in: $excludeIds, type: ANIME, sort: POPULARITY_DESC) {
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
                    tags: tags,
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
        const words = descriptionQuery.toLowerCase().split(/\s+/);
        const tags = [];

        words.forEach(w => {
            // Remove punctuation
            const cleanWord = w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
            if (KEYWORD_TO_TAG[cleanWord]) {
                tags.push(KEYWORD_TO_TAG[cleanWord]);
            }
        });

        // Deduplicate
        const uniqueTags = [...new Set(tags)];

        if (uniqueTags.length === 0) {
            // No tags found, return empty or fallback?
            // Let's return empty and let UI handle "No vibe found"
            return { data: [], pagination: { has_next_page: false } };
        }

        return await searchAnimeByTags(uniqueTags, page);

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
