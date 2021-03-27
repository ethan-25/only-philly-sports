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

mlb = `https://bdfed.stitch.mlbinfra.com/bdfed/transform-mlb-mini-scoreboard?stitch_env=prod&sortTemplate=4&sportId=1&startDate=${today}&endDate=${today}&gameType=E&&gameType=S&language=en&leagueId=103&&leagueId=104`;

nhl = `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${today}&endDate=${today}&hydrate=team,linescore,broadcasts(all),tickets,game(content(media(epg)),seriesSummary),radioBroadcasts,metadata,seriesSummary(series)&site=en_nhl&teamId=&gameType=&timecode=`;

console.log(today);

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

document.getElementById("toSettings").addEventListener("click", toggleSettings);

function toggleSettings() {
  var mainPage = document.getElementById("main");
  var settingsPage = document.getElementById("settings-page");
  settingsPage.style.display = "block";
  mainPage.style.display = "none";
}

document.getElementById("toMain").addEventListener("click", toggleMain);

function toggleMain() {
  var mainPage = document.getElementById("main");
  var settingsPage = document.getElementById("settings-page");
  settingsPage.style.display = "none";
  mainPage.style.display = "block";
}
*/
// Fetching Sixers games for today

fetch(nba)
  .then((res) => res.json())
  .then((out) => {
    var nbagames = out.games;
    var found = false;

    for (var game in nbagames) {
      if (
        nbagames[game].hTeam.triCode == "PHI" ||
        nbagames[game].vTeam.triCode == "PHI"
      ) {
        var found = true;

        var home = nbagames[game].hTeam;
        var away = nbagames[game].vTeam;

        document.getElementById(
          "nba-away-logo"
        ).src = `https://cdn.nba.com/logos/nba/${away.teamId}/primary/L/logo.svg`;
        document.getElementById(
          "nba-home-logo"
        ).src = `https://cdn.nba.com/logos/nba/${home.teamId}/primary/L/logo.svg`;

        if (nbagames[game].isGameActivated == "true") {
          // linescore = nbagames[game].linescore;

          document.getElementById(
            "nba-score"
          ).textContent = `${away.triCode} ${away.score} - ${home.score} ${home.triCode}`;

          document.getElementById(
            "nba-status"
          ).textContent = `Quarter ${nbagames[games].period.current} | ${linescore.currentPeriodTimeRemaining}`;
          document.getElementById("nba-status").style.color = "red";

          if (nbagames[game].isHalftime == "true") {
            document.getElementById("nba-status").textContent = "Half";
          }
        } else {
          if (nbagames[game].gameDuration.minutes == "") {
            var time = new Date(nbagames[game].startTimeUTC);
            var time24 = time.toString().slice(16, 21);

            document.getElementById(
              "nba-score"
            ).textContent = `${away.triCode} @ ${home.triCode}`;
            document.getElementById("nba-status").textContent = `${time24} EST`;
          } else {
            document.getElementById(
              "nba-score"
            ).textContent = `${away.score} - ${home.score}`;
            document.getElementById("nba-status").textContent = "Final";
          }
        }
      } else if (found == false) {
        document.getElementById("nba-score").textContent = "No games found.";
      }
    }
  });

// Fetching NHL and MLB games for today
function NHLMLB(api) {
  fetch(api)
    .then((res) => res.json())
    .then((out) => {
      var apidates = out.dates;
      var found = false;

      for (var date in apidates) {
        // For each date in the scheduled NHL/MLB dates for games, find the one associated with today's date

        var apigames = apidates[date].games;

        for (var game in apigames) {
          if (
            // If the Flyers or Phils are playing among today's scheduled games, set the names of home and away team
            apigames[game].teams.home.team.abbreviation == "PHI" ||
            apigames[game].teams.away.team.abbreviation == "PHI"
          ) {
            var found = true;

            var away = apigames[game].teams.away.team;
            var home = apigames[game].teams.home.team;

            if (api == nhl) {
              document.getElementById(
                "nhl-away-logo"
              ).src = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${away.id}.svg`;
              document.getElementById(
                "nhl-home-logo"
              ).src = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${home.id}.svg`;
            } else {
              document.getElementById(
                "mlb-away-logo"
              ).src = `https://www.mlbstatic.com/team-logos/team-cap-on-light/${away.id}.svg`;
              document.getElementById(
                "mlb-home-logo"
              ).src = `https://www.mlbstatic.com/team-logos/team-cap-on-light/${home.id}.svg`;
            }

            if (
              apigames[game].status.detailedState == "In Progress" ||
              apigames[game].status.detailedState == "In Progress - Critical"
            ) {
              // If the game is live, continuously update the score

              linescore = apigames[game].linescore;
              if (api == nhl) {
                document.getElementById(
                  "nhl-score"
                ).textContent = `${away.teamName} ${linescore.teams.away.goals} - ${linescore.teams.home.goals} ${home.teamName}`;
                document.getElementById(
                  "nhl-status"
                ).textContent = `Period ${linescore.currentPeriod} | ${linescore.currentPeriodTimeRemaining}`;
                document.getElementById("nhl-status").style.color = "red";
              } else {
                document.getElementById(
                  "mlb-score"
                ).textContent = `${away.abbreviation} ${linescore.teams.away.runs} - ${linescore.teams.home.runs} ${home.abbreviation}`;

                document.getElementById(
                  "mlb-status"
                ).textContent = `${linescore.inningState} of the ${linescore.currentInningOrdinal}`;
                document.getElementById("mlb-status").style.color = "red";
              }
            } else if (apigames[game].status.abstractGameState == "Final") {
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
          } else if (found == false) {
            if (api == nhl) {
              document.getElementById("nhl-score").textContent =
                "No games found.";
            } else {
              document.getElementById("mlb-score").textContent =
                "No games found.";
            }
          }
        }
      }
    });
}

NHLMLB(mlb);
NHLMLB(nhl);
