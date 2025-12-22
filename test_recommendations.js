
import { searchAnime } from './src/services/api.js';

// Mock function for recommendation since it's not in api.js yet
async function getRecommendations(id) {
    const url = `https://api.jikan.moe/v4/anime/${id}/recommendations`;
    console.log(`Fetching recommendations for ID: ${id}...`);
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
}

async function testRecs() {
    // 1. Search for "Naruto" to get ID
    const searchRes = await searchAnime("Naruto");
    if (!searchRes.data || searchRes.data.length === 0) {
        console.error("Naruto not found");
        return;
    }
    const naruto = searchRes.data[0];
    console.log(`Found Source Anime: ${naruto.title} (ID: ${naruto.mal_id})`);

    // 2. Get Recommendations
    const recs = await getRecommendations(naruto.mal_id);
    console.log(`Found ${recs.length} recommendations.`);
    recs.slice(0, 5).forEach(r => {
        console.log(`- ${r.entry.title} (Votes: ${r.votes})`);
    });
}

testRecs();
