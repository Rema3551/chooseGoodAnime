
const query = `
query {
  Media(search: "Solo Leveling", type: ANIME) {
    title {
      romaji
      english
    }
    tags {
      name
      rank
      isMediaSpoiler
    }
  }
}
`;

async function getSoloLevelingTags() {
    console.log("Fetching tags for Solo Leveling...");
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        const media = data.data.Media;
        console.log(`Title: ${media.title.english || media.title.romaji}`);
        console.log("Tags:");
        media.tags.forEach(t => console.log(`- ${t.name} (Rank: ${t.rank})`));

    } catch (error) {
        console.error("Error:", error);
    }
}

getSoloLevelingTags();
