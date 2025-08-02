const { crawlArtist } = require("./spotify-crawler");
require("dotenv").config();

// Your list of artist names
const artistList = [
  "Earl Sweatshirt",
  "Joey Bada$$",
  "Denzel Curry",
  "IDK",
  "Cordae",
  "Mick Jenkins",
  "Freddie Gibbs",
  "Benny the Butcher",
  "Westside Gunn",
  "Conway the Machine",
  "Pop Smoke",
  "Mac Miller",
  "XXXTentacion",
  "Nipsey Hussle",
  "MF DOOM",
  "The Alchemist",
  "Madlib",
  "J Dilla",
  "Knxwledge",
  "9th Wonder",
  "DJ Premier",
  "Metro Boomin",
  "Hit-Boy",
  "Kenny Beats",
  "Action Bronson",
  "Boldy James",
  "Roc Marciano",
  "Mach-Hommy",
  "MIKE",
  "Navy Blue",
  "Open Mike Eagle",
  "Quelle Chris",
  "Billy Woods",
  "El-P",
  "Aesop Rock",
];

// Groups to rotate through
const crawlGroups = ["album", "single", "appears_on"];

async function batchCrawl() {
  for (const artist of artistList) {
    for (const group of crawlGroups) {
      console.log(`➡️ Attempting to crawl ${group} group for ${artist}`);
      try {
        await crawlArtist(artist, group);
      } catch (err) {
        console.error(`❌ Failed for ${artist} [${group}]:`, err.message);
      }
      await new Promise((res) => setTimeout(res, 500)); // prevent rate limits
    }
    console.log(`✅ Finished all groups for ${artist}\n`);
  }

  console.log("🎉 All crawl jobs attempted.");
}

batchCrawl();
