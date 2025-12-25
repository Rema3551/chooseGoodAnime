
const query = `
query ($tags: [String], $genres: [String]) {
  Page(page: 1, perPage: 5) {
    media(tag_in: $tags, genre_in: $genres, type: ANIME, sort: POPULARITY_DESC) {
      title {
        romaji
      }
      genres
      tags {
        name
      }
    }
  }
}
`;

async function testSearch(tags, genres, label) {
    console.log(`\n--- Testing ${label} ---`);
    console.log(`Tags: ${JSON.stringify(tags)}, Genres: ${JSON.stringify(genres)}`);
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: {
                    tags: tags,
                    genres: genres
                }
            })
        });

        const data = await response.json();
        if (data.errors) {
            console.error("Errors:", JSON.stringify(data.errors, null, 2));
        } else {
            const results = data.data.Page.media;
            console.log(`Found ${results.length} results.`);
            if (results.length > 0) {
                console.log("First result:", results[0].title.romaji);
            }
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

// Test 1: Comedy as Tag (Current behavior)
await testSearch(["Comedy"], undefined, "Comedy as Tag");

// Test 2: Comedy as Genre
await testSearch(undefined, ["Comedy"], "Comedy as Genre");

// Test 3: Isekai as Tag
await testSearch(["Isekai"], undefined, "Isekai as Tag");
