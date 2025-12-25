
import { searchAnime, getAnimeRecommendations, searchAniList } from './src/services/api.js';

async function simulateSimilarSearch(query) {
    console.log(`\n--- Simulating Similar Search for: "${query}" ---`);

    // 1. Search for Target
    const searchRes = await searchAnime(query);
    const candidates = searchRes.data || [];

    if (candidates.length === 0) {
        console.log("No anime found.");
        return;
    }

    const target = candidates[0];
    console.log(`Target: ${target.title} (ID: ${target.mal_id})`);
    console.log(`Genres: ${target.genres?.length}, Themes: ${target.themes?.length}, Demographics: ${target.demographics?.length}`);
    console.log(`Genres List: ${target.genres?.map(g => g.name).join(', ')}`);
    console.log(`Themes List: ${target.themes?.map(g => g.name).join(', ')}`);
    console.log(`Demographics List: ${target.demographics?.map(g => g.name).join(', ')}`);

    // 2. Get Recommendations
    const recs = await getAnimeRecommendations(target.mal_id);

    if (recs && recs.length > 0) {
        console.log(`[Direct Info] Found ${recs.length} recommendations directly.`);
        console.log(`Sample: ${recs[0].title}`);
    } else {
        console.log("[Fallback Info] No direct recommendations. Triggering fallback...");

        // 3. Fallback Logic
        // 3. Fallback Logic
        const metadata = [
            ...(target.genres || []),
            ...(target.themes || []),
            ...(target.demographics || [])
        ];

        const genres = metadata.map(g => g.name).join(' ');

        if (genres) {
            console.log(`Searching Vibe with query: "${genres}"`);
            const vibeRes = await searchAniList(genres, 1);
            const fallbackResults = (vibeRes.data || []).filter(a => a.mal_id !== target.mal_id);

            console.log(`[Fallback Result] Found ${fallbackResults.length} similar anime via Vibe.`);
            if (fallbackResults.length > 0) {
                console.log(`Sample: ${fallbackResults[0].title}`);
            }
        } else {
            console.log("[Fallback Info] No genres/themes available for fallback.");
        }
    }
}

async function run() {
    // await simulateSimilarSearch("Naruto"); 
    await simulateSimilarSearch("Monster");
}

run();
