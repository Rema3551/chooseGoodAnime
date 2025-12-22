// Native fetch in Node 18+

const delay = ms => new Promise(r => setTimeout(r, ms));

async function check(desc, url) {
    console.log(`\n--- ${desc} ---`);
    console.log(`URL: ${url}`);
    try {
        const r = await fetch(url);
        const data = await r.json();
        console.log(`Count: ${data.data?.length}`);
        if (data.data && data.data.length > 0) {
            const first = data.data[0];
            console.log(`Title: ${first.title}`);
            console.log(`Producers: ${first.producers.map(p => `${p.name} (${p.mal_id})`).join(', ')}`);
            console.log(`Licensors: ${first.licensors.map(l => `${l.name} (${l.mal_id})`).join(', ')}`);
        }
    } catch (e) {
        console.error(e.message);
    }
}

async function run() {
    // 1. Check Netflix Only
    await check('Netflix (1977)', 'https://api.jikan.moe/v4/anime?producers=1977&limit=1');
    await delay(1000);

    // 2. Check Disney Only
    await check('Disney (417)', 'https://api.jikan.moe/v4/anime?producers=417&limit=1');
    await delay(1000);

    // 3. Check Both (Grouped)
    await check('Netflix OR Disney (1977,417)', 'https://api.jikan.moe/v4/anime?producers=1977,417&limit=1');
}

run();
