
import { searchAnime } from './src/services/api.js';

async function testSearch() {
    console.log("Testing Jikan Search Capabilities...");

    const queries = [
        "Solo Leveling", // Control
        "overpowered character dungeon", // English description
        "personnage surpuissant donjon", // French description
        "leveling",
        "hunter monster portal"
    ];

    for (const q of queries) {
        console.log(`\nSearching for: "${q}"`);
        try {
            const res = await searchAnime(q);
            const hits = res.data || [];
            console.log(`Found ${hits.length} results.`);
            if (hits.length > 0) {
                console.log("Top 3 results:");
                hits.slice(0, 3).forEach(a => console.log(`- ${a.title} (Score: ${a.score})`));
            }
        } catch (e) {
            console.error("Error:", e.message);
        }
        // Delay to be safe
        await new Promise(r => setTimeout(r, 1000));
    }
}

testSearch();
