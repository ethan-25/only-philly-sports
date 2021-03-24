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

mlb =
  "https://bdfed.stitch.mlbinfra.com/bdfed/transform-mlb-schedule?stitch_env=prod&sortTemplate=5&sportId=1&startDate=2021-04-01&endDate=2021-04-03&gameType=E&&gameType=S&&gameType=R&&gameType=F&&gameType=D&&gameType=L&&gameType=W&&gameType=A&language=en&leagueId=104&&leagueId=103&contextTeamId=";

nhl =
  "https://statsapi.web.nhl.com/api/v1/schedule?startDate=2021-03-22&endDate=2021-03-27&hydrate=team,linescore,broadcasts(all),tickets,game(content(media(epg)),seriesSummary),radioBroadcasts,metadata,seriesSummary(series)&site=en_nhl&teamId=&gameType=&timecode=";

console.log(today);

// Fetching Sixers games for today

fetch(nba)
  .then((res) => res.json())
  .then((out) => {
    var nbagames = out.games;

    for (var game in nbagames) {
      var homeTeam = nbagames[game].hTeam;
      var awayTeam = nbagames[game].vTeam;

      if (homeTeam.triCode == "PHI" || awayTeam.triCode == "PHI") {
        console.log(nbagames[game].gameCode, nbagames[game].gameStatusText);
        break;
      }
    }
  });

fetch(mlb)
  .then((res) => res.json())
  .then((out) => {
    var mlbdates = out.dates;

    for (var date in mlbdates) {
      if (mlbdates[date].date == today) {
        var mlbgames = nhldates[date].games;
        for (var game in mlbgames) {
          if (
            mlbgames[game].teams.home.team.teamName == "Phillies" ||
            mlbgames[game].teams.away.team.teamName == "Phillies"
          ) {
            var away = mlbgames[game].teams.away.team.teamName;
            var home = mlbgames[game].teams.home.team.teamName;
            document.getElementById("mlb-score").textContent =
              away + " @ " + home;
            break;
          }
        }
      }
    }
  });

// Fetching Flyers games for today

fetch(nhl)
  .then((res) => res.json())
  .then((out) => {
    var nhldates = out.dates;

    for (var date in nhldates) {
      if (nhldates[date].date == today) {
        // For each date in the scheduled NHL dates for games, find the one associated with today's date

        var nhlgames = nhldates[date].games;

        for (var game in nhlgames) {
          if (
            // If the Flyers are playing among today's scheduled games, set the names of home and away team
            nhlgames[game].teams.home.team.teamName == "Flyers" ||
            nhlgames[game].teams.away.team.teamName == "Flyers"
          ) {
            var away = nhlgames[game].teams.away.team;
            var home = nhlgames[game].teams.home.team;

            document.getElementById(
              "nhl-away-logo"
            ).src = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${away.id}.svg`;
            document.getElementById(
              "nhl-home-logo"
            ).src = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${home.id}.svg`;

            if (nhlgames[game].status.abstractGameState == "Live") {
              // If the game is live, continuously update the score

              linescore = nhlgames[game].linescore;

              document.getElementById(
                "nhl-score"
              ).textContent = `${away.teamName} ${linescore.teams.away.goals} - ${linescore.teams.home.goals} ${home.teamName}`;

              document.getElementById(
                "nhl-status"
              ).textContent = `Period ${linescore.currentPeriod} | ${linescore.currentPeriodTimeRemaining}`;
            } else if (nhlgames[game].status.abstractGameState == "Final") {
              // Else, if the game is done, show the final scores

              var awayScore = nhlgames[game].teams.away.score;
              var homeScore = nhlgames[game].teams.home.score;

              var awayRecord = nhlgames[game].teams.away.leagueRecord;
              var homeRecord = nhlgames[game].teams.home.leagueRecord;

              document.getElementById("nhl-status").textContent = "FINAL";
              document.getElementById(
                "nhl-score"
              ).textContent = `${awayScore} - ${homeScore}`;
              /*
              document.getElementById(
                "nhl-away-record"
              ).textContent = `(${awayRecord.wins} - ${awayRecord.losses})`;
              document.getElementById(
                "nhl-home-record"
              ).textContent = `(${homeRecord.wins} - ${homeRecord.losses})`;
              */
            } else {
              // Otherwise, set the time for the next upcoming game

              var time = nhlgames[game].gameDate.slice(11, 16);
              document.getElementById(
                "nhl-score"
              ).textContent = `${away} @ ${home}`;
              document.getElementById("nhl-status").textContent = `${time} EST`;
            }
          }
        }
      }
    }
  });
