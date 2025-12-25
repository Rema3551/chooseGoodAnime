
import { searchAniList } from './src/services/api.js';

async function test() {
    console.log("Testing searchAniList with 'drôle'...");
    const res = await searchAniList("drôle");
    console.log(`Found ${res.data.length} results.`);
    if (res.data.length > 0) {
        console.log("First Title:", res.data[0].title);
        console.log("Genres:", res.data[0].genres);
    } else {
        console.log("No results found.");
    }
}

test();
