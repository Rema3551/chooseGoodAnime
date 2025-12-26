import { searchAniList, searchAnimeByTags } from './api.js';

// Helper to get tags for a specific anime title from AniList
const getAnimeTags = async (title) => {
    // We reuse searchAniList but we need to find the specific anime first.
    // Actually searchAniList does a broad search.
    // Let's issue a specific query to get details of one anime by title.
    const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        idMal
        title {
            english
            romaji
        }
        genres
        tags {
          name
          rank
          category
          isMediaSpoiler
          isGeneralSpoiler
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

// Helper to extract unique top tags
const getTopTags = (details) => {
    if (!details.tags) return [];

    // Log raw tags count to verify we have data
    // console.log(`[Mixer] Raw tags for ${details.title.english || details.title.romaji}: ${details.tags.length}`);

    return details.tags
        //.filter(t => t.rank > 40 && !t.isMediaSpoiler && !t.isGeneralSpoiler) 
        .filter(t => !t.isMediaSpoiler && !t.isGeneralSpoiler) // Removed rank filter for safety
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 8)
        .map(t => t.name);
};

export const mixAnimes = async (animeA, animeB) => {
    try {
        console.log(`[Mixer] Mixing: ${animeA.title} + ${animeB.title}`);

        // 1. Get Rich Tags from AniList for both sources
        const [detailsA, detailsB] = await Promise.all([
            getAnimeTags(animeA.title),
            getAnimeTags(animeB.title)
        ]);

        if (!detailsA || !detailsB) {
            throw new Error(`Could not find data for one of the animes.`);
        }

        const tagsA = getTopTags(detailsA);
        const tagsB = getTopTags(detailsB);
        const genresA = detailsA.genres || [];
        const genresB = detailsB.genres || [];

        const excludeIds = [detailsA.id, detailsB.id, detailsA.idMal, detailsB.idMal].filter(Boolean);

        console.log(`[Mixer] A (${animeA.title}): Genres=[${genresA.join(',')}], Tags=[${tagsA.slice(0, 3).join(',')}]`);
        console.log(`[Mixer] B (${animeB.title}): Genres=[${genresB.join(',')}], Tags=[${tagsB.slice(0, 3).join(',')}]`);

        // 2. Build Broad Candidate Pool using CROSS-POLLINATION Strategies
        const candidates = [];

        // Strategy 1: The "Flavor Swap 1" -> Tags of A + Genres of B
        const tagsForA = tagsA.slice(0, 4);
        const genresForB = genresB;
        if (tagsForA.length > 0 && genresForB.length > 0) {
            const resultsA = await searchAnimeByTags(tagsForA, genresForB, 1, excludeIds);
            const hits = resultsA.data || [];
            console.log(`[Mixer] Strategy 1 (Tags A + Genres B): ${hits.length} hits`);
            candidates.push(...hits);
        }

        // Strategy 2: The "Flavor Swap 2" -> Tags of B + Genres of A
        const tagsForB = tagsB.slice(0, 4);
        const genresForA = genresA;
        if (tagsForB.length > 0 && genresForA.length > 0) {
            const resultsB = await searchAnimeByTags(tagsForB, genresForA, 1, excludeIds);
            const hits = resultsB.data || [];
            console.log(`[Mixer] Strategy 2 (Tags B + Genres A): ${hits.length} hits`);
            candidates.push(...hits);
        }

        // Strategy 3: The "Pure Mix" (Top tags from both, top genres from both) - Fallback if disjoint
        if (candidates.length < 5) {
            console.log("[Mixer] Candidates low, running Strategy 3 (Union Fallback)...");
            const mixTags = [...tagsA.slice(0, 3), ...tagsB.slice(0, 3)];
            const mixGenres = [...genresA.slice(0, 2), ...genresB.slice(0, 2)];
            const resultsMix = await searchAnimeByTags(mixTags, mixGenres, 1, excludeIds);
            const hits = resultsMix.data || [];
            console.log(`[Mixer] Strategy 3 (Union): ${hits.length} hits`);
            candidates.push(...hits);
        }

        // Strategy 4: The "Broad Genre Fallback" (The absolute safety net)
        // Since AniList "genre_in" is AND logic, we cannot just send all genres.
        // We must fetch Top Genres from A and B separately (Simulating OR).
        if (candidates.length < 5) {
            console.log("[Mixer] Candidates critical, running Strategy 4 (Split Genres)...");

            // Pick primary genre from A and B
            const primaryGenreA = genresA[0];
            const primaryGenreB = genresB[0];

            // Fetch A's primary genre
            if (primaryGenreA) {
                const resultsA = await searchAnimeByTags([], [primaryGenreA], 1, excludeIds);
                console.log(`[Mixer] Strategy 4 (Genre: ${primaryGenreA}): ${resultsA.data?.length || 0} hits`);
                candidates.push(...(resultsA.data || []));
            }

            // Fetch B's primary genre (if different)
            if (primaryGenreB && primaryGenreB !== primaryGenreA) {
                const resultsB = await searchAnimeByTags([], [primaryGenreB], 1, excludeIds);
                console.log(`[Mixer] Strategy 4 (Genre: ${primaryGenreB}): ${resultsB.data?.length || 0} hits`);
                candidates.push(...(resultsB.data || []));
            }
        }

        // Deduplicate candidates
        const uniqueCandidates = Array.from(new Map(candidates.map(item => [item.mal_id, item])).values());
        console.log(`[Mixer] Total Unique Candidates: ${uniqueCandidates.length}`);

        // 3. Fuzzy Scoring System
        const scoredCandidates = uniqueCandidates.map(anime => {
            let score = 0;
            let reasons = [];

            const candidateTags = (anime.tags || []).map(t => t.name);
            const candidateGenres = (anime.genres || []).map(g => g.name);
            const allCandidateTraits = [...candidateTags, ...candidateGenres];

            // Analyzers
            const hasTraitA = allCandidateTraits.some(t => tagsA.includes(t) || genresA.includes(t));
            const hasTraitB = allCandidateTraits.some(t => tagsB.includes(t) || genresB.includes(t));

            // Matching Logic
            // Check overlaps with A
            const traitsFromA = allCandidateTraits.filter(t => tagsA.includes(t) || genresA.includes(t));
            // Check overlaps with B
            const traitsFromB = allCandidateTraits.filter(t => tagsB.includes(t) || genresB.includes(t));

            const uniqueTraitsFromA = [...new Set(traitsFromA)];
            const uniqueTraitsFromB = [...new Set(traitsFromB)];

            // Base Score: Only give points if it has traits from *at least one* parent significantly
            score += (uniqueTraitsFromA.length + uniqueTraitsFromB.length);

            // Bonus: Intersection (The "Mixer" Goal)
            // If it shares traits with BOTH, huge bonus. We want the child of both.
            if (uniqueTraitsFromA.length > 0 && uniqueTraitsFromB.length > 0) {
                score += 15; // Massive boost for being a true mix
                reasons.push(`Combines ${uniqueTraitsFromA.slice(0, 2).join(', ')} (A) & ${uniqueTraitsFromB.slice(0, 2).join(', ')} (B)`);
            } else if (uniqueTraitsFromA.length > 0) {
                reasons.push(`Similar to ${animeA.title} (${uniqueTraitsFromA.slice(0, 2).join(', ')})`);
            } else if (uniqueTraitsFromB.length > 0) {
                reasons.push(`Similar to ${animeB.title} (${uniqueTraitsFromB.slice(0, 2).join(', ')})`);
            }

            return {
                ...anime,
                mixScore: score,
                mixReason: reasons[0] || "Similar vibes"
            };
        });

        // 4. Sort and Return
        scoredCandidates.sort((a, b) => b.mixScore - a.mixScore);

        // Filter out low scores if necessary, but returning "something" (best effort) is better than nothing.

        return {
            data: scoredCandidates.slice(0, 12), // Return top 12
            pagination: { has_next_page: false }
        };

    } catch (error) {
        console.error("Mixer error:", error);
        throw error;
    }
};
