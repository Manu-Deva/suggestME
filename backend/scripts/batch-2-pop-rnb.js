require("dotenv").config();
const axios = require("axios");
const neo4j = require("neo4j-driver");
const { getSpotifyToken } = require("../src/utils/spotifyToken");

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PASS = process.env.NEO4J_PASS;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASS)
);
const session = driver.session();

async function getSpotifyAppToken() {
  return await getSpotifyToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeAxiosGet(url, options) {
  while (true) {
    try {
      return await axios.get(url, options);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers["retry-after"];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
        console.warn(`Rate limited. Waiting for ${waitTime}ms...`);
        await sleep(waitTime);
      } else {
        throw error;
      }
    }
  }
}

async function getArtistByName(name) {
  const token = await getSpotifyAppToken();
  const url = `https://api.spotify.com/v1/search`;
  const params = { q: name, type: "artist", limit: 1 };
  const headers = { Authorization: `Bearer ${token}` };
  const res = await safeAxiosGet(url, { params, headers });
  await sleep(100);
  return res.data.artists.items[0];
}

async function getArtistAlbums(artistId) {
  const token = await getSpotifyAppToken();
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums`;
  const headers = { Authorization: `Bearer ${token}` };
  const params = {
    limit: 55,
    include_groups: "album,single,appears_on",
  };
  const res = await safeAxiosGet(url, { headers, params });
  await sleep(100);
  return res.data.items;
}

async function getAlbumTracks(albumId) {
  const token = await getSpotifyAppToken();
  const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
  const headers = { Authorization: `Bearer ${token}` };
  const params = { limit: 50 };
  const res = await safeAxiosGet(url, { headers, params });
  await sleep(100);
  return res.data.items;
}

async function upsertArtist(artist) {
  await session.run(
    `MERGE (a:Artist {id: $id})
     SET a.name = $name, a.spotify_url = $url`,
    { id: artist.id, name: artist.name, url: artist.external_urls.spotify }
  );
}

async function upsertCollaboration(artistA, artistB, track, album) {
  await session.run(
    `MATCH (a:Artist {id: $idA}), (b:Artist {id: $idB})
     MERGE (a)-[r:COLLABORATED_ON {track: $track, album: $album}]->(b)`,
    { idA: artistA.id, idB: artistB.id, track: track.name, album: album.name }
  );
}

async function crawlArtist(name) {
  const artist = await getArtistByName(name);
  if (!artist) {
    console.log(`❌ Artist not found: ${name}`);
    return;
  }

  console.log(
    `📀 Processing ${
      artist.name
    } (${artist.followers.total.toLocaleString()} followers)`
  );
  await upsertArtist(artist);

  const albums = await getArtistAlbums(artist.id);
  console.log(`  Found ${albums.length} albums`);

  let collaborationCount = 0;
  for (const album of albums) {
    const tracks = await getAlbumTracks(album.id);
    for (const track of tracks) {
      for (const featured of track.artists) {
        await upsertArtist(featured);
        if (featured.id !== artist.id) {
          await upsertCollaboration(artist, featured, track, album);
          await upsertCollaboration(featured, artist, track, album); // undirected
          collaborationCount++;
        }
      }
    }
  }
  console.log(`  ✅ Added ${collaborationCount} collaborations`);
}

async function main() {
  const popRnbArtists = [
    "Taylor Swift",
    "Ed Sheeran",
    "Justin Bieber",
    "Dua Lipa",
    "Billie Eilish",
    "Olivia Rodrigo",
    "Doja Cat",
    "Gracie Abrams",
    "Sabrina Carpenter",
    "Lizzo",
    "Harry Styles",
    "BTS",
    "Blackpink",
    "Bad Bunny",
    "J Balvin",
    "Frank Ocean",
    "The Weeknd",
    "Bruno Mars",
    "Ariana Grande",
    "SZA",
    "H.E.R.",
    "Summer Walker",
    "Jhené Aiko",
    "Kehlani",
    "Daniel Caesar",
    "Giveon",
    "Brent Faiyaz",
    "Lucky Daye",
    "Charlie Puth",
    "Shawn Mendes",
    "Troye Sivan",
    "Niall Horan",
    "Selena Gomez",
    "Ava Max",
    "Tate McRae",
    "Conan Gray",
    "Reneé Rapp",
    "Beabadoobee",
    "Maisie Peters",
    "FLETCHER",
    "Madison Beer",
    "Zara Larsson",
    "Khalid",
    "6LACK",
    "Tinashe",
    "Mahalia",
    "Arlo Parks",
    "Omar Apollo",
    "RAYE",
    "Victoria Monét",
    "Amber Mark",
    "Alina Baraz",
    "Nao",
    "Leon Bridges",
    "Snoh Aalegra",
    "Rosalía",
    "Karol G",
    "Rauw Alejandro",
    "Seventeen",
    "TXT",
    "IVE",
    "NewJeans",
    "TWICE",
    "ENHYPEN",
  ];

  console.log("🎵 BATCH 2: Pop & R&B Artists");
  console.log(`Starting to crawl ${popRnbArtists.length} artists...`);
  console.log("=".repeat(50));

  for (let i = 0; i < popRnbArtists.length; i++) {
    const name = popRnbArtists[i];
    console.log(`\n[${i + 1}/${popRnbArtists.length}] Crawling: ${name}`);
    try {
      await crawlArtist(name);
      console.log(`✅ Completed: ${name}`);
    } catch (error) {
      console.error(`❌ Error crawling ${name}:`, error.message);
    }
    // Add delay between artists
    await sleep(500);
  }

  console.log("\n🎉 BATCH 2 COMPLETED!");
  console.log(
    "You can now test connections between pop, R&B, and hip-hop artists!"
  );
  await session.close();
  await driver.close();
}

main().catch(console.error);
