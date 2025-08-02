const neo4j = require('neo4j-driver');
const middy = require('middy');
const { cors } = require('middy/middlewares');
require('dotenv').config();

const handler = async (event) => {
  console.log("Handler invoked");
  let body;
  try {
    body = JSON.parse(event.body);
    console.log("Parsed body:", body);
  } catch (e) {
    console.error("JSON parse error:", e);
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }
  
  const { startArtist, endArtist } = body;
  if (!startArtist || !endArtist) {
    console.error("Missing artist names");
    return { statusCode: 400, body: JSON.stringify({ error: "Missing startArtist or endArtist" }) };
  }

  console.log(`Searching for connection between: ${startArtist} and ${endArtist}`);

  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS)
  );
  
  const session = driver.session();
  try {
    console.log("Running Cypher query...");
    const result = await session.run(
      `MATCH (a:Artist {name: $start}), (b:Artist {name: $end}),
       p = shortestPath((a)-[:COLLABORATED_ON*]-(b))
       RETURN p`,
      { start: startArtist, end: endArtist }
    );
    
    console.log("Query result:", result.records.length);
    
    if (result.records.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "No connection found between these artists" }) };
    }
    
    // Format the path with track information
    const path = result.records[0].get('p');
    const connections = [];
    
    // Extract nodes and relationships from the path
    for (let i = 0; i < path.segments.length; i++) {
      const segment = path.segments[i];
      const relationship = segment.relationship;
      
      connections.push({
        from: segment.start.properties.name,
        to: segment.end.properties.name,
        track: relationship.properties.track,
        album: relationship.properties.album
      });
    }
    
    console.log("Formatted connections:", connections);
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        connections: connections,
        pathLength: connections.length
      }) 
    };
    
  } catch (error) {
    console.error("Handler error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    await session.close();
    await driver.close();
    console.log("Session and driver closed");
  }
};

exports.handler = middy(handler).use(cors()); 