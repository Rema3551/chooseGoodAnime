const BASE_URL = 'https://api.jikan.moe/v4';

/**
 * Delays execution for a specified amount of time to avoid rate limiting.
 * Jikan API has strict rate limits (3 requests/second, 60 requests/minute).
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getTopAnime = async (page = 1) => {
    try {
        const response = await fetch(`${BASE_URL}/top/anime?page=${page}`);
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

        console.log(`Searching AniList with tags: ${uniqueTags.join(', ')} (Page ${page})`);

        // 2. Build GraphQL Query
        // We filter by `tag_in` (must have at least one? No, `tag_in` is OR by default in some contexts, but let's check).
        // Actually `tag_in` matches *any* of the tags. We want *all* ideally?
        // AniList `tag_in` is OR. `tag_and` doesn't exist directly on `media` arguments?
        // Wait, `genre_in` is OR.
        // If we want specific combinations, we might need to filter client side or use advanced query.
        // BUT, for "Vibe", getting ANY match is often better than zero results.
        // Let's use `tag_in` effectively.

        const query = `
        query ($tags: [String], $page: Int) {
          Page(page: $page, perPage: 20) {
            pageInfo {
              hasNextPage
            }
            media(tag_in: $tags, type: ANIME, sort: POPULARITY_DESC) {
              id
              idMal
              title {
                romaji
                english
              }
              coverImage {
                large
              }
              averageScore
              genres
              seasonYear
              description
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
                variables: { tags: uniqueTags, page: page }
            })
        });

        const data = await response.json();
        const aniListResults = data.data?.Page?.media || [];
        const hasNextPage = data.data?.Page?.pageInfo?.hasNextPage || false;

        // 3. Map to Jikan Format
        const mappedResults = aniListResults.map(item => ({
            mal_id: item.idMal || item.id, // Prefer MAL ID if available
            title: item.title.english || item.title.romaji,
            images: {
                jpg: {
                    large_image_url: item.coverImage.large,
                    image_url: item.coverImage.large
                }
            },
            score: item.averageScore ? (item.averageScore / 10).toFixed(2) : 'N/A',
            genres: item.genres.map(g => ({ name: g })),
            year: item.seasonYear,
            synopsis: item.description, // AniList description is HTML sometimes
            producers: [] // AniList doesn't give easy producer IDs mapping without extra queries, leave empty
        }));

        // Client-side cleanup: Filter out items that don't have ALL tags if we want strictness?
        // Or confirm matches.
        // For now, let's keep it loose (OR logic) because strict (AND) often returns 0 results on AniList if not exact.
        // IMPROVEMENT: Sort by how many tags match?

        return {
            data: mappedResults,
            pagination: { has_next_page: hasNextPage }
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
