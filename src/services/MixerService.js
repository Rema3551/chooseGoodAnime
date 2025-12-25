import { searchAniList, searchAnimeByTags } from './api';

// Helper to get tags for a specific anime title from AniList
const getAnimeTags = async (title) => {
    // We reuse searchAniList but we need to find the specific anime first.
    // Actually searchAniList does a broad search.
    // Let's issue a specific query to get details of one anime by title.
    const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        title {
            english
            romaji
        }
        genres
        tags {
          name
          rank
          category
        }
      }
    }
    `;

    try {
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
        return data.data?.Media || null;
    } catch (error) {
        console.error("Error fetching anime tags for mixer:", error);
        return null;
    }
};

export const mixAnimes = async (animeA, animeB) => {
    try {


        // 1. Get Rich Tags from AniList for both sources
        // We run in parallel for speed
        const [detailsA, detailsB] = await Promise.all([
            getAnimeTags(animeA.title),
            getAnimeTags(animeB.title)
        ]);

        if (!detailsA || !detailsB) {
            throw new Error("Could not find data for one of the animes.");
        }

        // 2. Extract and Rank Tags
        const getTopTags = (details) => {
            if (!details.tags) return [];
            // Filter out spoilers and vary rank. Relaxed to 40 to get more candidates.
            return details.tags
                .filter(t => t.rank > 40 && !t.isMediaSpoiler && !t.isGeneralSpoiler)
                .map(t => t.name);
        };

        const tagsA = getTopTags(detailsA);
        const tagsB = getTopTags(detailsB);
        const genresA = detailsA.genres || [];
        const genresB = detailsB.genres || [];

        // 3. The Alchemy Logic (Intersection & Union)
        // Find tags present in BOTH (High Priority)
        const commonTags = tagsA.filter(tag => tagsB.includes(tag));
        const commonGenres = genresA.filter(g => genresB.includes(g));

        // If no commonality, take top tags from each
        let mixTags = [];
        if (commonTags.length > 0) {
            mixTags = [...commonTags];
        }

        // Add top 3 unique tags from each (increased from 2)
        const uniqueA = tagsA.filter(t => !commonTags.includes(t)).slice(0, 3);
        const uniqueB = tagsB.filter(t => !commonTags.includes(t)).slice(0, 3);

        // We don't want too many tags or search gets too restrictive (AND logic?) 
        // Our searchAnimeByTags uses 'tag_in' (OR logic) but we want results that feel like a mix.
        // If we send TOO many tags to an OR search in AniList, we get generic results.
        // WE NEED A BALANCED QUERY.
        // Let's try to prioritize the SHARED ones.

        const finalQueryTags = [...new Set([...commonTags, ...uniqueA, ...uniqueB, ...commonGenres])];

        // 4. Exclude Parent IDs
        const excludeIds = [detailsA.id, detailsB.id];
        // Also exclude MAL IDs just in case, though api uses AniList ID for exclusion in current impl
        // The API we wrote accepts excludeIds for the 'id_not_in' field in AniList

        // 5. Search Strategy

        // Attempt 1: Balanced Mix (Tags + Genres)
        let searchTags = finalQueryTags.slice(0, 6);
        let results = await searchAnimeByTags(searchTags, 1, excludeIds);

        // Attempt 2: Fallback to just Genres if detailed tags failed (Broad Search)
        if (!results.data || results.data.length === 0) {

            const broadGenres = [...new Set([...genresA, ...genresB])].slice(0, 4);
            if (broadGenres.length > 0) {
                results = await searchAnimeByTags(broadGenres, 1, excludeIds);
                searchTags = broadGenres;
            }
        }

        // Attempt 3: "Opposites Attract" - Just take the top tag of A and top tag of B
        if (!results.data || results.data.length === 0) {

            const lastResortTags = [
                tagsA[0] || genresA[0],
                tagsB[0] || genresB[0]
            ].filter(Boolean);

            if (lastResortTags.length > 0) {
                results = await searchAnimeByTags(lastResortTags, 1, excludeIds);
                searchTags = lastResortTags;
            }
        }

        // 6. Post-processing to add "Why?" context
        // We want to tell the user: "Because it has [Tag X] from [Anime A] and [Tag Y] from [Anime B]"
        const enhancedResults = (results.data || []).map(anime => {
            // Find which tags match
            const animeTags = anime.tags ? anime.tags.map(t => t.name) : [];
            const returnedGenres = anime.genres ? anime.genres.map(g => g.name) : [];
            const allAnimeTraits = [...animeTags, ...returnedGenres];

            const sharedTraits = searchTags.filter(t => allAnimeTraits.includes(t));

            return {
                ...anime,
                mixReason: `Shares characteristics: ${sharedTraits.join(', ')}`
            };
        });

        return {
            ...results,
            data: enhancedResults
        };

    } catch (error) {
        console.error("Mixer error:", error);
        throw error;
    }
};
