
import { searchAnime } from './src/services/api.js';

async function checkTags(title) {
    console.log(`\n--- Checking Tags for: "${title}" ---`);
    const res = await searchAnime(title);
    if (res.data && res.data.length > 0) {
        const anime = res.data[0];
        console.log(`Title: ${anime.title}`);
        console.log("Genres:", anime.genres.map(g => g.name));
        console.log("Tags:", anime.tags ? anime.tags.map(t => t.name) : "No tags found");
    } else {
        console.log("Anime not found.");
    }
}

checkTags("Ouran High School Host Club");
