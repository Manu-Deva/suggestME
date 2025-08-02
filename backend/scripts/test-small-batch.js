// Copy of batch-1 but with only 2 artists for testing
require('dotenv').config();
const axios = require('axios');
const neo4j = require('neo4j-driver');
const { getSpotifyToken } = require('../src/utils/spotifyToken');

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PASS = process.env.NEO4J_PASS;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
const session = driver.session();

async function getSpotifyAppToken() {
  return await getSpotifyToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeAxiosGet(url, options) {
  while (true) {
    try {
      return await axios.get(url, options);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        console.warn(`Rate limited. Waiting for ${waitTime}ms...`);
        await sleep(waitTime);
      } else if (error.response && error.response.status === 502) {
        console.warn(`502 error. Waiting 5 seconds and retrying...`);
        await sleep(5000);
      } else {
        throw error;
      }
    }
  }
}

async function getArtistByName(name) {
  const token = await getSpotifyAppToken();
  const url = `https://api.spotify.com/v1/search`;
  const params = { q: name, type: 'artist', limit: 1 };
  const headers = { Authorization: `Bearer ${token}` };
  const res = await safeAxiosGet(url, { params, headers });
  await sleep(2000);
  return res.data.artists.items[0];
}

async function upsertArtist(artist) {
  await session.run(
    `MERGE (a:Artist {id: $id})
     SET a.name = $name, a.spotify_url = $url`,
    { id: artist.id, name: artist.name, url: artist.external_urls.spotify }
  );
}

async function main() {
  const testArtists = ['Eminem', 'Adele']; // Try different artists
  
  console.log('🧪 TESTING: Small batch crawl');
  console.log(`Testing with ${testArtists.length} artists...`);
  
  for (let i = 0; i < testArtists.length; i++) {
    const name = testArtists[i];
    console.log(`\n[${i + 1}/${testArtists.length}] Testing: ${name}`);
    try {
      const artist = await getArtistByName(name);
      console.log(`🔍 Search result for ${name}:`, artist ? 'Found' : 'Not found');
      if (artist) {
        console.log(`✅ Found ${artist.name} (${artist.followers?.total?.toLocaleString() || 'Unknown'} followers)`);
        await upsertArtist(artist);
      } else {
        console.log(`❌ Artist not found: ${name}`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${name}:`, error.message);
    }
    await sleep(3000); // Long delay between tests
  }
  
  console.log('\n🧪 Test completed!');
  await session.close();
  await driver.close();
}

main().catch(console.error);