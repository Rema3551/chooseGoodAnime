
const query = `
query {
  Page(page: 1, perPage: 10) {
    media(tag_in: ["Overpowered Main Character", "Dungeon"], type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
      }
      tags {
        name
      }
      averageScore
    }
  }
}
`;

async function testAniListSpecific() {
    const url = 'https://graphql.anilist.co';
    console.log("Searching AniList for tags: [Overpowered Main Character, Dungeon]...");

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        const results = data.data.Page.media;

        results.forEach(a => {
            console.log(`- ${a.title.english || a.title.romaji} (Score: ${a.averageScore})`);
            // Check if Solo Leveling is here
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

testAniListSpecific();
