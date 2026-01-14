document.addEventListener("DOMContentLoaded", () => {

    const scoreBody = document.getElementById("score-body");
    let players = JSON.parse(localStorage.getItem("tournamentPlayers"));

    if (!players || players.length === 0) {
        alert("Aucun joueur trouvé !");
        window.location.href = "index.html";
        return;
    }

    const roundCountSpan = document.getElementById("round-count");

    let currentRound = parseInt(localStorage.getItem("currentRound")) || 1;
    let totalRounds = parseInt(localStorage.getItem("totalRounds")) || Math.ceil(Math.log2(players.length));

    localStorage.setItem("totalRounds", totalRounds);
    localStorage.setItem("currentRound", currentRound);

    const roundsRemaining = totalRounds - currentRound + 1;
    roundCountSpan.textContent = roundsRemaining > 0 ? roundsRemaining : 0;

    console.log("Joueurs à l'arrivée sur score.html :", players);

    players.forEach(p => {
        p.victory ??= 0;
        p.defeat ??= 0;
        p.score ??= 0;
        p.winrate ??= 0;
    });

    players.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.victory !== a.victory) return b.victory - a.victory;
        return b.winrate - a.winrate;
    });

    let lastScore = null;
    let placement = 0;

    function formatScore(num) {
        return num.toString().padStart(9, "0");
    }

    players.forEach((player, index) => {
        const row = document.createElement("tr");

        if (player.score !== lastScore) placement = index + 1;
        lastScore = player.score;

        const placementCell = document.createElement("td");
        placementCell.textContent = placement;
        placementCell.classList.add(
            placement === 1 ? "gold" :
                placement === 2 ? "silver" :
                    placement === 3 ? "bronze" : "blue"
        );

        const nameCell = document.createElement("td");
        nameCell.textContent = player.name;

        const victoryCell = document.createElement("td");
        victoryCell.textContent = player.victory;

        const defeatCell = document.createElement("td");
        defeatCell.textContent = player.defeat;

        const scoreCell = document.createElement("td");
        scoreCell.textContent = formatScore(player.score);

        row.appendChild(placementCell);
        row.appendChild(nameCell);
        row.appendChild(victoryCell);
        row.appendChild(defeatCell);
        row.appendChild(scoreCell);

        scoreBody.appendChild(row);
    });

    const quitButton = document.getElementById("quit-button");
    const nextRoundButton = document.getElementById("next-round");

    quitButton.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    if (roundsRemaining <= 0) {
        nextRoundButton.style.display = "none";

        const finishButton = document.createElement("button");
        finishButton.id = "finish-tournament";
        finishButton.textContent = "Terminer le tournoi";
        finishButton.className = nextRoundButton.className;

        nextRoundButton.parentNode.appendChild(finishButton);

        finishButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    } else {
        nextRoundButton.addEventListener("click", () => {
            if (!players || players.length === 0) {
                alert("Aucun joueur trouvé !");
                window.location.href = "index.html";
                return;
            }

            window.location.href = "round.html";
        });
    }

});
