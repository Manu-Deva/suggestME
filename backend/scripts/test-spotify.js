require('dotenv').config();
const { getSpotifyToken } = require('../src/utils/spotifyToken');
const axios = require('axios');

async function testSpotify() {
  try {
    console.log('🎵 Testing Spotify API connection...');
    
    // Test token generation
    const token = await getSpotifyToken(
      process.env.SPOTIFY_CLIENT_ID,
      process.env.SPOTIFY_CLIENT_SECRET
    );
    
    console.log('✅ Got Spotify token:', token ? 'SUCCESS' : 'FAILED');
    
    // Test API call
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: { q: 'Drake', type: 'artist', limit: 1 },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Spotify API test successful');
    console.log('Artist found:', response.data.artists.items[0]?.name);
    
  } catch (error) {
    console.error('❌ Spotify API test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSpotify();