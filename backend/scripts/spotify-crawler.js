// Crawl Spotify artist data in stages and update Neo4j crawl flags (optimized with write-to-JSON + token auto-refresh)
require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
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

let globalSpotifyToken = null;

async function refreshSpotifyToken() {
  globalSpotifyToken = await getSpotifyToken(
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET
  );
  return globalSpotifyToken;
}

async function getSpotifyAppToken() {
  return await refreshSpotifyToken();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(min = 300, max = 700) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
      } else if (
        error.response &&
        error.response.status === 401 &&
        !options._retried
      ) {
        console.warn("Token expired. Refreshing...");
        const newToken = await refreshSpotifyToken();
        globalSpotifyToken = newToken;
        options.headers.Authorization = `Bearer ${newToken}`;
        options._retried = true;
      } else {
        throw error;
      }
    }
  }
}

async function getArtistByName(name) {
  const url = `https://api.spotify.com/v1/search`;
  const params = { q: name, type: "artist", limit: 1 };
  const headers = { Authorization: `Bearer ${globalSpotifyToken}` };
  const res = await safeAxiosGet(url, { params, headers });
  await sleep(jitter(100, 200));
  return res.data.artists.items[0];
}

async function getArtistAlbums(
  artistId,
  includeGroup = "album",
  maxAlbums = 100
) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums`;
  const headers = { Authorization: `Bearer ${globalSpotifyToken}` };
  const params = { limit: 50, include_groups: includeGroup };

  let allAlbums = [];
  let offset = 0;
  while (allAlbums.length < maxAlbums) {
    const res = await safeAxiosGet(url, {
      headers,
      params: { ...params, offset },
    });
    const items = res.data.items;
    allAlbums.push(...items);
    if (items.length < 50) break;
    offset += 50;
    await sleep(jitter(100, 200));
  }
  return allAlbums.slice(0, maxAlbums);
}

async function getAlbumTracks(albumId, maxTracks = 100) {
  const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
  const headers = { Authorization: `Bearer ${globalSpotifyToken}` };
  const params = { limit: 50 };

  let allTracks = [];
  let offset = 0;
  while (allTracks.length < maxTracks) {
    const res = await safeAxiosGet(url, {
      headers,
      params: { ...params, offset },
    });
    const items = res.data.items;
    allTracks.push(...items);
    if (items.length < 50) break;
    offset += 50;
    await sleep(jitter(100, 200));
  }
  return allTracks.slice(0, maxTracks);
}

async function upsertArtist(artist, crawlStatus = {}) {
  await session.run(
    `MERGE (a:Artist {id: $id})
     SET a.name = $name,
         a.spotify_url = $url,
         a.albums_crawled = COALESCE($albums_crawled, a.albums_crawled),
         a.singles_crawled = COALESCE($singles_crawled, a.singles_crawled),
         a.collabs_crawled = COALESCE($collabs_crawled, a.collabs_crawled)`,
    {
      id: artist.id,
      name: artist.name,
      url: artist.external_urls.spotify,
      albums_crawled: crawlStatus.albums_crawled ?? null,
      singles_crawled: crawlStatus.singles_crawled ?? null,
      collabs_crawled: crawlStatus.collabs_crawled ?? null,
    }
  );
}

async function upsertCollaboration(artistA, artistB, track, album) {
  await session.run(
    `MATCH (a:Artist {id: $idA}), (b:Artist {id: $idB})
     MERGE (a)-[r:COLLABORATED_ON {
       track: $track,
       album: $album,
       track_artists: $track_artists
     }]->(b)`,
    {
      idA: artistA.id,
      idB: artistB.id,
      track: track.name,
      album: album.name,
      track_artists: track.artists.map((a) => a.name),
    }
  );
}

async function hasCrawledGroup(artistId, group) {
  const result = await session.run(
    `MATCH (a:Artist {id: $id}) RETURN a.${group}_crawled AS crawled`,
    { id: artistId }
  );
  const record = result.records[0];
  return record && record.get("crawled") === true;
}

async function crawlArtist(name, group = "album") {
  const artist = await getArtistByName(name);
  if (!artist) {
    console.log(`❌ Artist not found: ${name}`);
    return;
  }

  console.log(`🎧 Processing ${artist.name} — group: ${group}`);
  if (await hasCrawledGroup(artist.id, group)) {
    console.log(`⏭️ Already crawled ${group} for ${name}`);
    return;
  }

  const albums = await getArtistAlbums(artist.id, group, 100);
  console.log(`  Found ${albums.length} items in group '${group}'`);

  const savePath = path.join(__dirname, "../data");
  if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);
  const outFile = path.join(savePath, `${artist.id}_${group}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      { artist, albums, group, timestamp: new Date().toISOString() },
      null,
      2
    )
  );

  let collaborationCount = 0;
  for (const album of albums) {
    const tracks = await getAlbumTracks(album.id, 100);
    for (const track of tracks) {
      const trackArtistIds = track.artists.map((a) => a.id);
      if (!trackArtistIds.includes(artist.id)) continue;

      for (const featured of track.artists) {
        await upsertArtist(featured);
        if (featured.id !== artist.id) {
          await upsertCollaboration(artist, featured, track, album);
          await upsertCollaboration(featured, artist, track, album);
          collaborationCount++;
        }
      }
    }
  }

  const crawlStatus = {
    albums_crawled: group === "album" ? true : null,
    singles_crawled: group === "single" ? true : null,
    collabs_crawled: group === "appears_on" ? true : null,
  };
  await upsertArtist(artist, crawlStatus);

  console.log(
    `  ✅ Added ${collaborationCount} collaborations from group '${group}'`
  );
}

module.exports = { crawlArtist };
