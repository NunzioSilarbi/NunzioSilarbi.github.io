document.addEventListener("DOMContentLoaded", () => {

    const playersBody = document.getElementById("players-body");
    const addPlayerBtn = document.getElementById("add-player");
    const startTournamentBtn = document.getElementById("start-tournament");

    // Met à jour les numéros
    function updatePlayerNumbers() {
        const rows = playersBody.querySelectorAll("tr");
        rows.forEach((row, index) => {
            const numberSpan = row.querySelector(".player-number");
            if (numberSpan) numberSpan.textContent = index + 1;
        });
    }

    // Crée une ligne joueur
    function createPlayerRow(name = "") {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        const numberSpan = document.createElement("span");
        numberSpan.className = "player-number";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Nom du joueur";
        input.value = name;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.className = "remove-player";
        removeBtn.onclick = () => {
            row.remove();
            updatePlayerNumbers();
        };

        cell.appendChild(numberSpan);
        cell.appendChild(input);
        cell.appendChild(removeBtn);

        row.appendChild(cell);
        playersBody.appendChild(row);

        updatePlayerNumbers();
        input.focus();
    }

    // Ajouter une ligne via ➕
    addPlayerBtn.addEventListener("click", () => {
        createPlayerRow();
    });

    // Initialise la première ligne
    function initializeFirstRow() {
        const firstRow = playersBody.querySelector("tr");
        if (!firstRow) return;

        firstRow.innerHTML = "";

        const cell = document.createElement("td");

        const numberSpan = document.createElement("span");
        numberSpan.className = "player-number";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Nom du joueur";

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.className = "remove-player";
        removeBtn.onclick = () => {
            firstRow.remove();
            updatePlayerNumbers();
        };

        cell.appendChild(numberSpan);
        cell.appendChild(input);
        cell.appendChild(removeBtn);

        firstRow.appendChild(cell);

        updatePlayerNumbers();
    }

    initializeFirstRow();

// Récupère tous les joueurs
    function getAllPlayers() {
        const rows = playersBody.querySelectorAll("tr");
        const players = [];

        rows.forEach(row => {
            const input = row.querySelector("input");

            if (input && input.value.trim() !== "") {
                players.push({
                    name: input.value.trim(),

                    // Statistiques
                    victory: 0,
                    defeat: 0,
                    winrate: null,          // % victoire (null tant qu'aucun match)

                    score: 0,

                    // Historique
                    opponents: [],          // déjà existant
                    adversaries: []         // nouveau tableau
                });
            }
        });

        return players;
    }

    // Bouton démarrer tournoi
    startTournamentBtn.addEventListener("click", () => {
        const players = getAllPlayers();

        if (players.length === 0) {
            alert("Veuillez ajouter au moins un joueur !");
            return;
        }

        // Sauvegarde dans localStorage
        localStorage.setItem("tournamentPlayers", JSON.stringify(players));

        // Redirection vers la page tournoi
        window.location.href = "./tournament.html";
    });

});
