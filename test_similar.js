
import { searchAnime, getAnimeRecommendations } from './src/services/api.js';

async function testSimilar(query) {
    console.log(`\n--- Testing Similar Search for: "${query}" ---`);

    // 1. Search
    const searchRes = await searchAnime(query);
    const candidates = searchRes.data || [];

    if (candidates.length === 0) {
        console.log("No anime found for query.");
        return;
    }

    const target = candidates[0];
    console.log(`Target found: ${target.title} (ID: ${target.mal_id})`);

    // 2. Recommendations
    try {
        const recs = await getAnimeRecommendations(target.mal_id);
        console.log(`Recommendations count: ${recs.length}`);
        if (recs.length > 0) {
            console.log(`Top 3: ${recs.slice(0, 3).map(r => r.title).join(', ')}`);
        } else {
            console.log("!!! NO RECOMMENDATIONS FOUND !!!");
        }
        // End of function not repeated since I am just closing it properly


    } catch (e) {
        console.error("Error fetching recs:", e.message);
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    await testSimilar("Naruto"); await delay(1000); // Should work
    await testSimilar("Berserk"); await delay(1000); // Should work
    await testSimilar("Monster"); await delay(1000); // Ambiguous?
    await testSimilar("Odd Taxi"); await delay(1000); // Might have few recs?
    await testSimilar("Un anime qui n'existe pas"); // Should fail search
}

run();
