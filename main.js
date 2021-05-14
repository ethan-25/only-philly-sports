/* 
Getting today's date and assign variables to it. Each variable will have a different date format because
the NBA endpoint utilizes a different date format to request data for today compared to the other ones.
*/
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 01
var yyyy = today.getFullYear();

today = yyyy + "-" + mm + "-" + dd;
nbaToday = yyyy + mm + dd;

// API Endpoints for scheduled games in the NFL, NBA, MLB, and NHL
nba = `http://data.nba.net/prod/v2/${nbaToday}/scoreboard.json`;

mlb = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=143&hydrate=team,linescore,game(content(summary,media(epg)),tickets)&language=en&startDate=${today}&endDate=${today}`;
//`https://statsapi.mlb.com/api/v1/schedule?sportId=1&gamePk=632189&hydrate=team,linescore,game(content(summary,media(epg)),tickets)&useLatestGames=true&language=en&flipDate=${today}`;

nhl = `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${today}&endDate=${today}&useLatestGames=true&hydrate=team(),linescore,game(),&site=en_nhl&teamId=4&timecode=`;

console.log(`Fetching Philadelphia games for today, ${today}`);

// Function to convert the 24 hour time to 12 hour time.
/** 
function timeTo12(time) {
  var hours = time.slice(0, 2);
  var mins = time.slice(3, 5);

  if (Number(hours) >= 12) {
    var abb = "PM";
  } else {
    var abb = "AM";
  }
  var hours = ((Number(hours) + 11) % 12) + 1;

  console.log(`${hours}:${mins} ${abb}`);
}

document.getElementById("toRecords").addEventListener("click", toggleRecords);

function toggleRecords() {
  var mainPage = document.getElementById("main");
  var recordsPage = document.getElementById("records-page");
  recordsPage.style.display = "block";
  mainPage.style.display = "none";
}

document.getElementById("toMain").addEventListener("click", toggleMain);

function toggleMain() {
  var mainPage = document.getElementById("main");
  var recordsPage = document.getElementById("records-page");
  recordsPage.style.display = "none";
  mainPage.style.display = "block";
}
*/

// Fetching Sixers games for today
fetch(nba)
  .then((res) => res.json())
  .then((out) => {
    var nbagames = out.games;

    for (var game in nbagames) {
      // For each game in the JSON
      if (
        // If the Sixers are in either home or away, set found to true and set up the home and away logos
        nbagames[game].hTeam.triCode == "PHI" ||
        nbagames[game].vTeam.triCode == "PHI"
      ) {
        document.getElementById("nba").style.display = "block";

        var home = nbagames[game].hTeam;
        var away = nbagames[game].vTeam;

        document.getElementById(
          "nba-away-logo"
        ).src = `https://cdn.nba.com/logos/nba/${away.teamId}/primary/L/logo.svg`;
        document.getElementById(
          "nba-home-logo"
        ).src = `https://cdn.nba.com/logos/nba/${home.teamId}/primary/L/logo.svg`;

        if (
          nbagames[game].isGameActivated == true &&
          nbagames[game].period.current >= 1
        ) {
          // If the game is live, get the live score and live time
          document.getElementById("nba-status").style.color = "red";
          document.getElementById(
            "nba-score"
          ).textContent = `${away.triCode} ${away.score} - ${home.score} ${home.triCode}`;
          if (nbagames[game].gameDuration.minutes == "") {
            document.getElementById(
              "nba-status"
            ).textContent = `Quarter ${nbagames[game].period.current} | Starting`;
          } else {
            document.getElementById(
              "nba-status"
            ).textContent = `Quarter ${nbagames[game].period.current} | ${nbagames[game].clock}`;
          }
          if (nbagames[game].period.isHalftime == true) {
            // If the game is at the half, set the status to Half
            document.getElementById("nba-status").textContent = "Half";
          }
        } else {
          if (nbagames[game].gameDuration.minutes == "") {
            // If there is no game active, set the scheduled time and teams for tonight
            var time = new Date(nbagames[game].startTimeUTC);
            var time24 = time.toString().slice(16, 21);

            document.getElementById(
              "nba-score"
            ).textContent = `${away.triCode} @ ${home.triCode}`;
            document.getElementById("nba-status").textContent = `${time24} EST`;
          } else {
            // Else (game is over), set the final score
            document.getElementById(
              "nba-score"
            ).textContent = `${away.score} - ${home.score}`;
            document.getElementById("nba-status").textContent = "Final";
          }
        }
      }
    }
  });

// Function to fetch Phillies and Flyers games today
// Had to make a function because the JSON file format is the same for both api endpoints, would be more efficient to code this way
function NHLMLB(api) {
  fetch(api)
    .then((res) => res.json())
    .then((out) => {
      var apidates = out.dates;

      for (var date in apidates) {
        var apigames = apidates[date].games;

        for (var game in apigames) {
          // For each game in the JSON
          var away = apigames[game].teams.away.team;
          var home = apigames[game].teams.home.team;

          if (
            // If the Flyers or Phillies are playing today, set the names and logos of home and away team
            home.abbreviation == "PHI" ||
            away.abbreviation == "PHI"
          ) {
            if (api == nhl) {
              document.getElementById("nhl").style.display = "block";
              document.getElementById(
                "nhl-away-logo"
              ).src = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${away.id}.svg`;
              document.getElementById(
                "nhl-home-logo"
              ).src = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${home.id}.svg`;
            } else {
              document.getElementById("mlb").style.display = "block";
              document.getElementById(
                "mlb-away-logo"
              ).src = `https://www.mlbstatic.com/team-logos/${away.id}.svg`;
              document.getElementById(
                "mlb-home-logo"
              ).src = `https://www.mlbstatic.com/team-logos/${home.id}.svg`;
            }
            if (
              // If the game is in progress, continuously update the score
              apigames[game].status.detailedState == "In Progress" ||
              apigames[game].status.detailedState == "In Progress - Critical"
            ) {
              linescore = apigames[game].linescore;
              if (api == nhl) {
                // If the API is NHL, set up the NHL score and status
                document.getElementById("nhl-status").style.color = "red";
                document.getElementById(
                  "nhl-score"
                ).textContent = `${away.abbreviation} ${linescore.teams.away.goals} - ${linescore.teams.home.goals} ${home.abbreviation}`;
                document.getElementById(
                  "nhl-status"
                ).textContent = `Period ${linescore.currentPeriod} | ${linescore.currentPeriodTimeRemaining}`;
              } else {
                // Else, set up the MLB score and status
                document.getElementById("mlb-status").style.color = "red";
                document.getElementById(
                  "mlb-score"
                ).textContent = `${away.abbreviation} ${linescore.teams.away.runs} - ${linescore.teams.home.runs} ${home.abbreviation}`;

                document.getElementById(
                  "mlb-status"
                ).textContent = `${linescore.inningState} ${linescore.currentInningOrdinal}`;
              }
            } else if (apigames[game].status.detailedState == "Postponed") {
              // If game is postponed, indicate it is
              if (api == nhl) {
                document.getElementById("nhl-status").textContent = "Postponed";
                document.getElementById(
                  "nhl-score"
                ).textContent = `${away.abbreviation} @ ${home.abbreviation}`;
              } else {
                document.getElementById("mlb-status").textContent = "Postponed";
                document.getElementById(
                  "mlb-score"
                ).textContent = `${away.abbreviation} @ ${home.abbreviation}`;
              }
            } else if (
              apigames[game].status.detailedState == "Game Over" ||
              apigames[game].status.detailedState == "Final"
            ) {
              // Else, if the game is done, show the final scores

              var awayScore = apigames[game].teams.away.score;
              var homeScore = apigames[game].teams.home.score;

              if (api == nhl) {
                document.getElementById("nhl-status").textContent = "Final";
                document.getElementById(
                  "nhl-score"
                ).textContent = `${awayScore} - ${homeScore}`;
              } else {
                document.getElementById("mlb-status").textContent = "Final";
                document.getElementById(
                  "mlb-score"
                ).textContent = `${awayScore} - ${homeScore}`;
              }
            } else {
              // Otherwise, set the time for today's game
              var time = new Date(apigames[game].gameDate);
              var time24 = time.toString().slice(16, 21);

              if (api == nhl) {
                document.getElementById(
                  "nhl-score"
                ).textContent = `${away.abbreviation} @ ${home.abbreviation}`;
                document.getElementById(
                  "nhl-status"
                ).textContent = `${time24} EST`;
              } else {
                document.getElementById(
                  "mlb-score"
                ).textContent = `${away.abbreviation} @ ${home.abbreviation}`;
                document.getElementById(
                  "mlb-status"
                ).textContent = `${time24} EST`;
              }
            }
          }
        }
      }
    });
}

// Call the above function with parameter api
NHLMLB(mlb);
NHLMLB(nhl);
