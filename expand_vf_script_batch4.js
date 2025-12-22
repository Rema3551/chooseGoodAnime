
import { getTopAnime } from './src/services/api.js';
import { VF_GOLDEN_LIST } from './src/data/golden_list_vf.js';

// Simple delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkYoutubeVF(title) {
    const query = encodeURIComponent(`${title} bande annonce vf`);
    const url = `https://www.youtube.com/results?search_query=${query}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const text = await response.text();

        const keywords = [
            'Bande Annonce VF',
            'Trailer VF',
            'Complet VF',
            'Episode 1 VF',
            'Saison 1 VF',
            'Partie 1 VF',
            'Film VF'
        ];

        const hasVF = keywords.some(k => text.includes(k) || text.toLowerCase().includes(k.toLowerCase()));
        return hasVF;
    } catch (e) {
        console.error(`Error checking ${title}:`, e.message);
        return false;
    }
}

async function run() {
    console.log("Starting Batch 4 VF check (Pages 31-50)...");

    const existingIds = new Set(VF_GOLDEN_LIST);
    let newConfirmed = [];

    const START_PAGE = 31;
    const END_PAGE = 50; // Approx top 1250 anime

    for (let page = START_PAGE; page <= END_PAGE; page++) {
        console.log(`Fetching page ${page}...`);
        try {
            const res = await getTopAnime(page);
            const animes = res.data || [];

            for (const anime of animes) {
                if (existingIds.has(anime.mal_id)) {
                    continue;
                }

                // Rate limit protection
                await delay(1000 + Math.random() * 500);

                console.log(`[CHECK] Checking ${anime.title}...`);
                const isVF = await checkYoutubeVF(anime.title);

                if (isVF) {
                    console.log(`✅ FOUND VF for: ${anime.title}`);
                    newConfirmed.push(anime);
                } else {
                    // console.log(`❌ No obvious VF found for: ${anime.title}`);
                }
            }

            // Delay between pages
            await delay(2000);

        } catch (e) {
            console.error("Error in loop:", e);
        }
    }

    console.log("------------------------------------------------");
    console.log("BATCH 4 SCAN COMPLETE");
    console.log(`Found ${newConfirmed.length} new VF titles.`);
    console.log("------------------------------------------------");

    const output = newConfirmed.map(a => `${a.mal_id}, // ${a.title}`).join('\n    ');
    console.log("COPY THIS:");
    console.log(output);
}

run();
