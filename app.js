const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

module.exports = app;

let database = null;

databasePath = path.join(__dirname, "cricketMatchDetails.db");

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server running at https://localhost:3000/`);
    });
  } catch (error) {
    console.log(`DB error: "${error.message}"`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API-1 list of all players
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
        SELECT
            player_id AS playerId,
            player_name AS playerName
        FROM 
            player_details;`;
  const playersArray = await database.all(getAllPlayersQuery);
  response.send(playersArray);
});

//API-2 get player with player_id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT
            player_id AS playerId,
            player_name AS playerName
        FROM 
            player_details
        WHERE
            player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(player);
});

//API-3 update specific player based on player_id
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayersQuery = `
        UPDATE
            player_details
        SET 
            player_name = "${playerName}"
        WHERE
            player_id = ${playerId};`;
  await database.run(updatePlayersQuery);
  response.send(`Player Details Updated`);
});

//API-4 get match details of specific match with match_id
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
        SELECT 
            match_id AS matchId,
            match, 
            year
        FROM 
            match_details
        WHERE 
            match_id = ${matchId};`;
  const matchDetails = await database.get(getMatchDetailsQuery);
  response.send(matchDetails);
});

//API-5 get list of all matches of a player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
        SELECT 
            match_details.match_id AS matchId,
            match_details.match AS match,
            match_details.year AS year
        FROM 
            player_match_score JOIN match_details ON
            player_match_score.match_id = match_details.match_id
        WHERE 
            player_match_score.player_id = ${playerId};`;
  const playerMatches = await database.all(getPlayerMatchesQuery);
  response.send(playerMatches);
});

//API-6 return player details of specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersOfMatchQuery = `
        SELECT 
            player_details.player_id AS playerId,
            player_details.player_name AS playerName
        FROM 
            player_match_score JOIN player_details ON
            player_match_score.player_id = player_details.player_id
        WHERE 
            player_match_score.match_id = ${matchId};`;
  const matchPlayersArray = await database.all(getPlayersOfMatchQuery);
  response.send(matchPlayersArray);
});

//API-7 get the statistic of a player
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerStatsQuery = `
        SELECT 
            player_details.player_id AS playerId,
            player_details.player_name AS playerName,
            SUM(player_match_score.score) AS totalScore,
            SUM(player_match_score.fours) AS totalFours,
            SUM(player_match_score.sixes) AS totalSixes
        FROM 
            player_match_score JOIN player_details ON
            player_match_score.player_id = player_details.player_id
        GROUP BY 
             player_match_score.player_id
        HAVING 
            player_match_score.player_id = ${playerId};`;
  const playerStats = await database.get(getPlayerStatsQuery);
  response.send(playerStats);
});
