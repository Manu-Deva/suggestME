require('dotenv').config();
const neo4j = require('neo4j-driver');

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PASS = process.env.NEO4J_PASS;

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
const session = driver.session();

async function checkDatabase() {
  try {
    console.log('🔍 Checking Neo4j database...');
    
    // Count total artists
    const artistCount = await session.run('MATCH (a:Artist) RETURN count(a) as count');
    console.log(`📊 Total artists in database: ${artistCount.records[0].get('count')}`);
    
    // Count total collaborations
    const collabCount = await session.run('MATCH ()-[r:COLLABORATED_ON]->() RETURN count(r) as count');
    console.log(`🔗 Total collaborations in database: ${collabCount.records[0].get('count')}`);
    
    // Show some sample artists
    const sampleArtists = await session.run('MATCH (a:Artist) RETURN a.name as name LIMIT 10');
    console.log('\n🎤 Sample artists in database:');
    sampleArtists.records.forEach(record => {
      console.log(`  - ${record.get('name')}`);
    });
    
    // Show some sample collaborations
    const sampleCollabs = await session.run(`
      MATCH (a:Artist)-[r:COLLABORATED_ON]->(b:Artist) 
      RETURN a.name as from, b.name as to, r.track as track 
      LIMIT 5
    `);
    console.log('\n🎵 Sample collaborations:');
    sampleCollabs.records.forEach(record => {
      console.log(`  - ${record.get('from')} → ${record.get('to')} (via "${record.get('track')}")`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

checkDatabase(); 