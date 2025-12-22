const delay = ms => new Promise(r => setTimeout(r, ms));

// Mocking the App.jsx logic
const PLATFORMS = [
    {
        id: '1977',
        name: 'Netflix',
        ids: ['1977']
    }
];
const selectedPlatforms = ['1977'];

const searchAnime = async (q, filters) => {
    let url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&sfw`;

    if (filters.producers && filters.producers.length > 0) {
        url += `&producers=${filters.producers.join(',')}`;
    }
    if (filters.page) {
        url += `&page=${filters.page}`;
    }

    console.log(`Fetching: ${url}`);
    const r = await fetch(url);
    if (!r.ok) {
        console.error(`Error: ${r.status} ${r.statusText}`);
        const text = await r.text();
        console.error(text);
        return { data: [], pagination: {} };
    }
    return r.json();
};

async function runTest() {
    console.log("=== Debugging Surprise Logic for Netflix ===");

    // 1. Build IDs
    let allProducerIds = [];
    selectedPlatforms.forEach(pId => {
        const platformObj = PLATFORMS.find(p => p.id === pId);
        if (platformObj) {
            allProducerIds = [...allProducerIds, ...platformObj.ids];
        }
    });
    console.log("Producer IDs:", allProducerIds);

    const filters = {
        producers: allProducerIds,
    };

    // 2. Initial Fetch
    const initialResult = await searchAnime('', filters);
    console.log("Initial Result Pagination:", JSON.stringify(initialResult.pagination, null, 2));

    if (!initialResult.pagination || initialResult.pagination.last_visible_page <= 1) {
        console.log("Single page logic.");
        if (initialResult.data && initialResult.data.length > 0) {
            console.log("Found results in single page.");
        } else {
            console.log("No results in single page.");
        }
    } else {
        const totalPages = initialResult.pagination.last_visible_page;
        console.log("Total Pages:", totalPages);

        const maxPage = Math.min(totalPages, 50);
        const randomPage = Math.floor(Math.random() * maxPage) + 1;
        console.log("Random Page:", randomPage);

        await delay(1000); // Rate limit
        const randomPageResult = await searchAnime('', { ...filters, page: randomPage });
        console.log(`Results on page ${randomPage}:`, randomPageResult.data ? randomPageResult.data.length : 0);

        if (randomPageResult.data && randomPageResult.data.length > 0) {
            console.log("Sample Anime:", randomPageResult.data[0].title);
        } else {
            console.log("Empty data on random page!");
        }
    }
}

runTest();
