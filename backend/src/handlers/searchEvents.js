// src/handlers/searchEvents.js
const axios = require("axios");

const handler = async (event) => {
  const { genre, city } = JSON.parse(event.body);

  try {
    const response = await axios.get(
      "https://app.ticketmaster.com/discovery/v2/events.json",
      {
        params: {
          apikey: process.env.TICKETMASTER_API_KEY,
          keyword: genre,
          city: city,
        },
      }
    );

    const events = response.data._embedded
      ? response.data._embedded.events
      : [];

    return {
      statusCode: 200,
      body: JSON.stringify({ events }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to search events" }),
    };
  }
};

exports.handler = middy(handler).use(cors());
