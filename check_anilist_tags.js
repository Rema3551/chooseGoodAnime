
async function checksAniListTags(search) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        title {
          romaji
          english
        }
        genres
        tags {
          name
          rank
          category
        }
      }
    }
    `;

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { search }
    })
  });

  const data = await response.json();
  const media = data.data?.Media;

  if (media) {
    console.log(`Title: ${media.title.english || media.title.romaji}`);
    console.log("Genres:", media.genres);
    console.log("Tags:", media.tags.map(t => `${t.name} (${t.rank}%)`).join(', '));
  } else {
    console.log("Anime not found on AniList.");
  }
}

const term = process.argv[2] || "Naruto";
checksAniListTags(term);
