
import { searchAnimeByTags } from './src/services/api.js';

async function testTag(tag) {
    console.log(`\n--- Testing Tag: "${tag}" ---`);
    try {
        // Try as a tag
        const res = await searchAnimeByTags([tag]);
        console.log(`Found ${res.data.length} results.`);
        if (res.data.length > 0) {
            console.log(`Sample: ${res.data[0].title}`);
        } else {
            console.log("No results found.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

// testTag("Reverse Harem");
// testTag("Isekai"); // Should work
// testTag("Shoujo"); // Should work
// testTag("Reverse Harem"); // Fails?
// testTag("Bishounen");
// testTag("Female Harem");
testTag("School Club");
testTag("Reverse Harem");
