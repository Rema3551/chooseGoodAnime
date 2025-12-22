
const query = `
query ($search: String, $tags: [String]) {
  Page(page: 1, perPage: 5) {
    media(search: $search, genre_in: $tags, type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
      }
      genres
      tags {
        name
        rank
      }
    }
  }
}
`;

// Test 1: Search for "Solo Leveling" (Verification)
// Test 2: Search by Tag "Overpowered Main Character" + "Dungeon" (Simulating the user's request)

async function testAniList() {
    const url = 'https://graphql.anilist.co';

    // Scenario 2: Tag Search
    // Note: AniList tag search is slightly different. You filter by `tag_in`.
    const tagQuery = `
    query {
      Page(page: 1, perPage: 5) {
        media(tag_in: ["Overpowered Main Character", "Dungeon"], type: ANIME, sort: POPULARITY_DESC) {
          title {
            romaji
            english
          }
          tags {
            name
          }
        }
      }
    }
    `;

    console.log("Testing AniList Tag Search (Overpowered Main Character + Dungeon)...");

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query: tagQuery })
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testAniList();
