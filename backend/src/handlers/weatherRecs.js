const axios = require("axios");
const qs = require("querystring");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

const weatherGenreMap = [
  {
    condition: (w) => w.temp > 80 && w.cloudiness < 20,
    genre: "trance",
  },
  { condition: (w) => w.temp > 75 && w.humidity > 70, genre: "reggae" },
  { condition: (w) => w.temp < 32 && w.snow > 0, genre: "ambient" },
  { condition: (w) => w.temp < 40 && w.cloudiness > 80, genre: "industrial" },
  { condition: (w) => w.wind_speed > 20, genre: "punk-rock" },
  { condition: (w) => w.rain > 0 && w.temp > 60, genre: "jazz" },
  { condition: (w) => w.rain > 0 && w.temp < 50, genre: "blues" },
  {
    condition: (w) => w.cloudiness > 80 && w.temp > 70,
    genre: "dancehall",
  },
  { condition: (w) => w.cloudiness < 20 && w.temp > 70, genre: "pop" },
  { condition: (w) => w.temp > 85 && w.humidity < 30, genre: "psych-rock" },
  { condition: (w) => w.temp < 20, genre: "black-metal" },
  { condition: (w) => w.cloudiness > 90 && w.temp < 60, genre: "trip-hop" },
  { condition: (w) => w.temp > 75 && w.cloudiness < 30, genre: "salsa" },
  {
    condition: (w) => w.temp > 60 && w.temp < 75 && w.cloudiness < 50,
    genre: "indie-pop",
  },
  { condition: (w) => true, genre: "alternative" }, // default genre
];

const handler = async (event) => {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  try {
    const zipcode = event.queryStringParameters.zipcode || 60714;
    const weatherResponse = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          zip: `${zipcode},us`,
          appid: apiKey,
          units: "imperial",
        },
      }
    );

    // const weatherData = weatherResponse.data;
    // const result = {
    //   cloudiness: weatherData.clouds.all,
    //   temp: weatherData.main.temp,
    //   selected_genre: "rock",
    // };
    const weatherData = weatherResponse.data;
    const weatherConditions = {
      temp: weatherData.main.temp,
      cloudiness: weatherData.clouds.all,
      humidity: weatherData.main.humidity,
      wind_speed: weatherData.wind.speed,
      rain: weatherData.rain ? weatherData.rain["1h"] || 0 : 0,
      snow: weatherData.snow ? weatherData.snow["1h"] || 0 : 0,
    };

    const selectedGenre = weatherGenreMap.find((item) =>
      item.condition(weatherConditions)
    ).genre;

    const result = {
      ...weatherConditions,
      selected_genre: selectedGenre,
    };

    // // Genre selection logic
    // if (result.cloudiness < 25 && result.temp > 50) {
    //   result.selected_genre = "summer";
    // } else if (result.cloudiness > 75 && result.temp < 50) {
    //   result.selected_genre = "rainy-day";
    // } else if (result.cloudiness > 75 && result.temp > 50) {
    //   result.selected_genre = "study";
    // } else if (result.cloudiness > 50 && result.temp < 50) {
    //   result.selected_genre = "folk";
    // } else if (result.cloudiness > 50 && result.temp > 50) {
    //   result.selected_genre = "dubstep";
    // } else if (result.cloudiness > 25 && result.temp > 50) {
    //   result.selected_genre = "progressive-house";
    // } else if (result.cloudiness > 25 && result.temp < 50) {
    //   result.selected_genre = "acid-jazz";
    // }

    // Here you would add logic to fetch artists and tracks based on the selected genre
    // For example, you could use the Spotify API to get recommendations

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch recommendations" }),
    };
  }
};

exports.handler = middy(handler).use(cors());
