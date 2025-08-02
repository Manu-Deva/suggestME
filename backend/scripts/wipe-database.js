require('dotenv').config();
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS)
);

async function wipeDatabase() {
  const session = driver.session();
  try {
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('✅ All nodes and relationships deleted!');
  } catch (err) {
    console.error('❌ Error wiping database:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

wipeDatabase();