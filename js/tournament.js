document.addEventListener("DOMContentLoaded", () => {

    function formatScore(num) {
        return num.toString().padStart(9, "0");
    }

    const tournamentBody = document.getElementById("tournament-body");
    let players = JSON.parse(localStorage.getItem("tournamentPlayers"));

    function calculateRounds(playerCount) {
        return Math.ceil(Math.log2(playerCount));
    }

    if (!players || players.length === 0) {
        alert("Aucun joueur trouvé ! Veuillez d'abord ajouter des joueurs.");
        window.location.href = "index.html";
        return;
    }

    /* ============================
       GESTION DU NOMBRE DE ROUNDS
       (AFFICHAGE SIMPLE : X)
    ============================ */
    let totalRounds = localStorage.getItem("totalRounds");
    let currentRound;

    // Initialisation UNIQUEMENT si absent
    totalRounds = calculateRounds(players.length);
    localStorage.setItem("totalRounds", totalRounds);


    currentRound = 1;
    localStorage.setItem("currentRound", currentRound);


    // Nombre de rounds restants
    const remainingRounds = totalRounds - currentRound + 1;

    // 👉 AFFICHAGE SIMPLE (ex: "4")
    document.getElementById("round-count").textContent = remainingRounds;

    /* ============================
       CLASSEMENT (INCHANGÉ)
    ============================ */
    players.forEach(player => {
        const row = document.createElement("tr");

        const placementCell = document.createElement("td");

        const placement = 1;
        placementCell.textContent = placement;

        if (placement === 1) {
            placementCell.classList.add("gold");
        } else if (placement === 2) {
            placementCell.classList.add("silver");
        } else if (placement === 3) {
            placementCell.classList.add("bronze");
        } else {
            placementCell.classList.add("blue");
        }

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

        tournamentBody.appendChild(row);
    });

    const quitButton = document.getElementById("quit-button");
    const nextRoundButton = document.getElementById("next-round");

    quitButton.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    nextRoundButton.addEventListener("click", () => {
        window.location.href = "round.html";
    });
});
