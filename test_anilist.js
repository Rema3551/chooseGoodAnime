const q = `
query {
  Page(page: 1, perPage: 1) {
    media(search: "Naruto", type: ANIME) {
      title { romaji }
      externalLinks { site language }
      streamingEpisodes { title url site }
    }
  }
}`;

fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q })
})
    .then(r => r.json())
    .then(d => console.log(JSON.stringify(d, null, 2)))
    .catch(e => console.error(e));
