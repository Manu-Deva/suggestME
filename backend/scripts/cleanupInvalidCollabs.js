// cleanupInvalidCollabs.js
require("dotenv").config();
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS)
);

async function cleanInvalidCollaborations() {
  const session = driver.session();
  try {
    const query = `
      MATCH (a:Artist)-[r:COLLABORATED_ON]->(b:Artist)
      WHERE NOT r.track_artists CONTAINS a.name OR NOT r.track_artists CONTAINS b.name
      DELETE r
    `;
    const result = await session.run(query);
    console.log(
      `✅ Cleanup complete. Removed ${
        result.summary.counters.updates().relationshipsDeleted
      } invalid relationships.`
    );
  } catch (err) {
    console.error("❌ Error cleaning invalid collaborations:", err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

cleanInvalidCollaborations();
