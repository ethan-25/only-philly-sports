var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0");
var yyyy = today.getFullYear();

today = yyyy + "-" + mm + "-" + dd;
nbaToday = yyyy + mm + dd;

console.log(`Fetching Philadelphia games for today, ${today}`);

// API Endpoints for scheduled games in the NFL, NBA, MLB, and NHL
nba = `http://data.nba.net/prod/v2/${nbaToday}/scoreboard.json`;

mlb = `https://statsapi.mlb.com/api/v1/schedule?&sportId=1&teamId=143&date=${today}&sortBy=gameDate&hydrate=team,linescore`;

nhl = `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${today}&endDate=${today}&hydrate=team,linescore&teamId=4`;

// Function to convert the 24 hour time to 12 hour time. Will use this in the future

/*
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
          ).textContent = `${away.score} - ${home.score}`;
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
function NHLMLB(api, league) {
  fetch(api)
    .then((res) => res.json())
    .then((out) => {
      var apidates = out.dates;

      for (var date in apidates) {
        var apigames = apidates[date].games;

        for (var game in apigames) {
          document.getElementById(`${league}${game}`).style.display = "block";
          var away = apigames[game].teams.away;
          var home = apigames[game].teams.home;
          // Setting the logos. I wish they would have similar links to get them, but oh well
          if (api == nhl) {
            document.getElementById(
              "nhl-away-logo"
            ).src = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${away.team.id}.svg`;
            document.getElementById(
              "nhl-home-logo"
            ).src = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${home.team.id}.svg`;
          } else {
            document.getElementsByClassName("mlb-away-logo")[
              game
            ].src = `https://www.mlbstatic.com/team-logos/${away.team.id}.svg`;
            document.getElementsByClassName("mlb-home-logo")[
              game
            ].src = `https://www.mlbstatic.com/team-logos/${home.team.id}.svg`;
          }
          document.getElementById(
            `${league}${game}-score`
          ).textContent = `${away.score} - ${home.score}`;

          if (apigames[game].status.detailedState == "Postponed") {
            // Game postponed
            document.getElementById(`${league}${game}-status`).textContent =
              "Postponed";
            document.getElementById(
              `${league}${game}-score`
            ).textContent = `${away.team.abbreviation} @ ${home.team.abbreviation}`;
          } else if (apigames[game].status.detailedState == "Delayed: Rain") {
            // Rain delay
            document.getElementById(`${league}${game}-status`).textContent =
              "Rain Delay";
          } else if (
            apigames[game].status.detailedState == "In Progress" ||
            apigames[game].status.detailedState == "In Progress - Critical"
          ) {
            // Live game
            linescore = apigames[game].linescore;
            document.getElementById(`${league}${game}-status`).style.color =
              "red";
            if (league == "nhl") {
              // NHL Score. Uses Period and Goals
              document.getElementById(
                `${league}${game}-status`
              ).textContent = `Period ${linescore.currentPeriod} | ${linescore.currentPeriodTimeRemaining}`;
            } else {
              // MLB Score. Uses Inning and Runs
              document.getElementById(
                `${league}${game}-status`
              ).textContent = `${linescore.inningState} ${linescore.currentInningOrdinal}`;
            }
          } else if (
            apigames[game].status.detailedState == "Game Over" ||
            apigames[game].status.detailedState == "Final"
          ) {
            // Game over
            document.getElementById(`${league}${game}-status`).textContent =
              "Final";
          } else {
            // Game not played yet
            var time = new Date(apigames[game].gameDate);
            var time24 = time.toString().slice(16, 21);

            document.getElementById(
              `${league}${game}-status`
            ).textContent = `${time24} EST`;
            document.getElementById(
              `${league}${game}-score`
            ).textContent = `${away.team.abbreviation} @ ${home.team.abbreviation}`;
          }
        }
      }
    });
}

// Call the above function with appripriate parameters
NHLMLB(mlb, "mlb");
NHLMLB(nhl, "nhl");
