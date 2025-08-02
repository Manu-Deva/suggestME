// Ultra-conservative version of batch-1 with heavy rate limiting
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
  let retries = 0;
  const maxRetries = 5;
  
  while (retries < maxRetries) {
    try {
      return await axios.get(url, options);
    } catch (error) {
      retries++;
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 10000;
        console.warn(`Rate limited. Waiting for ${waitTime}ms... (retry ${retries}/${maxRetries})`);
        await sleep(waitTime);
      } else if (error.response && error.response.status === 502) {
        const waitTime = 15000 * retries; // Exponential backoff
        console.warn(`502 error. Waiting ${waitTime}ms... (retry ${retries}/${maxRetries})`);
        await sleep(waitTime);
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

async function getArtistByName(name) {
  const token = await getSpotifyAppToken();
  const url = `https://api.spotify.com/v1/search`;
  const params = { q: name, type: 'artist', limit: 1 };
  const headers = { Authorization: `Bearer ${token}` };
  const res = await safeAxiosGet(url, { params, headers });
  await sleep(5000); // Very conservative delay
  return res.data.artists.items[0];
}

async function getArtistAlbums(artistId) {
  const token = await getSpotifyAppToken();
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums`;
  const headers = { Authorization: `Bearer ${token}` };
  // Very limited - only 10 albums
  const params = { limit: 10, include_groups: "album,single" };
  const res = await safeAxiosGet(url, { headers, params });
  await sleep(5000);
  return res.data.items;
}

async function getAlbumTracks(albumId) {
  const token = await getSpotifyAppToken();
  const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
  const headers = { Authorization: `Bearer ${token}` };
  const params = { limit: 20 }; // Limit tracks too
  const res = await safeAxiosGet(url, { headers, params });
  await sleep(5000);
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
     MERGE (a)-[r:COLLABORATED_ON {
       track: $track, 
       album: $album,
       track_artists: $track_artists,
       album_type: $album_type,
       track_id: $track_id
     }]->(b)`,
    { 
      idA: artistA.id, 
      idB: artistB.id, 
      track: track.name, 
      album: album.name,
      track_artists: track.artists.map(a => a.name),
      album_type: album.album_type,
      track_id: track.id
    }
  );
}

async function crawlArtist(name) {
  const artist = await getArtistByName(name);
  if (!artist) {
    console.log(`❌ Artist not found: ${name}`);
    return;
  }
  
  console.log(`📀 Processing ${artist.name} (${artist.followers.total.toLocaleString()} followers)`);
  await upsertArtist(artist);
  
  const albums = await getArtistAlbums(artist.id);
  console.log(`  Found ${albums.length} albums`);
  
  // Filter albums to only include those where the artist is a primary artist
  const filteredAlbums = albums.filter(album => {
    return album.artists.some(albumArtist => albumArtist.id === artist.id);
  });
  
  console.log(`  Filtered to ${filteredAlbums.length} albums where ${artist.name} is a primary artist`);
  
  let collaborationCount = 0;
  for (const album of filteredAlbums) {
    console.log(`    Processing album: ${album.name}`);
    const tracks = await getAlbumTracks(album.id);
    for (const track of tracks) {
      // Only process tracks where our target artist actually appears
      const trackArtistIds = track.artists.map(a => a.id);
      if (!trackArtistIds.includes(artist.id)) {
        continue;
      }
      
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
  console.log(`  ✅ Added ${collaborationCount} collaborations`);
}

async function main() {
  // Start with just 3 artists to test
  const hipHopArtists = ['Eminem', 'Dr. Dre', 'Snoop Dogg'];
  
  console.log('🎤 BATCH 1: Hip-Hop/Rap Artists (Conservative)');
  console.log(`Starting to crawl ${hipHopArtists.length} artists...`);
  console.log('=' .repeat(50));
  
  for (let i = 0; i < hipHopArtists.length; i++) {
    const name = hipHopArtists[i];
    console.log(`\n[${i + 1}/${hipHopArtists.length}] Crawling: ${name}`);
    try {
      await crawlArtist(name);
      console.log(`✅ Completed: ${name}`);
    } catch (error) {
      console.error(`❌ Error crawling ${name}:`, error.message);
    }
    // Very long delay between artists
    console.log('⏱️ Waiting 10 seconds before next artist...');
    await sleep(10000);
  }
  
  console.log('\n🎉 CONSERVATIVE BATCH COMPLETED!');
  await session.close();
  await driver.close();
}

main().catch(console.error);