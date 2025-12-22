
const query = `
query {
  AnimationTag: Page(page: 1, perPage: 5) {
    tags(name: "Overpowered Main Character") {
      name
      id
      isMediaSpoiler
    }
  }
}
`;
// Actually, tags query is separate.
const query2 = `
query {
  TagCollection {
    name
  }
}
`;
// No, getting all tags is huge.
// Let's search for "Overpowered" in tags.

const tagSearchQuery = `
query {
  Page {
    tags = interactions(name_like: "Overpowered") {
       name
    }
  }
}
`;
// AniList API docs: Query.Page.mediaTagCollection (no? Query.TagCollection?)
// Let's just try to fetch the tag strictly.

const simpleQuery = `
query {
  MediaTagCollection {
    name
    category
  }
}
`;
// I will just use a simpler check: search for anime with "Overpowered Main Character" tag and see if ANY exist.

const checkTag = `
query {
  Page(page: 1, perPage: 1) {
    media(tag: "Overpowered Main Character", type: ANIME) {
      title { romaji }
    }
  }
}
`;

async function checkTagExists() {
    console.log("Checking if 'Overpowered Main Character' tag works...");
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: checkTag })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkTagExists();
