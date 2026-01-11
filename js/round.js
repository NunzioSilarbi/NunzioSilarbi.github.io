document.addEventListener("DOMContentLoaded", () => {

    /* =======================
       TIMER 50 MINUTES
    ======================= */
    const timerBtn = document.getElementById("round-timer");
    let timerInterval = null;
    let timeLeft = 50 * 60; // 50 minutes

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    timerBtn.textContent = formatTime(timeLeft);

    timerBtn.addEventListener("click", () => {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerBtn.textContent = "Temps écoulé";
                timerBtn.disabled = true;
                return;
            }
            timeLeft--;
            timerBtn.textContent = formatTime(timeLeft);
        }, 1000);
    });

    /* =======================
       RÉCUPÉRATION DES JOUEURS
    ======================= */
    let players = JSON.parse(localStorage.getItem("tournamentPlayers")) || [];

    if (!players.length) {
        alert("Aucun joueur trouvé !");
        window.location.href = "index.html";
        return;
    }

    /* =======================
       TRI SWISS
    ======================= */
    players.sort((a, b) => b.score - a.score);

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const scoreGroups = {};
    players.forEach(p => {
        if (!scoreGroups[p.score]) scoreGroups[p.score] = [];
        scoreGroups[p.score].push(p);
    });

    Object.values(scoreGroups).forEach(shuffle);

    let remainingPlayers = [];
    Object.keys(scoreGroups)
        .sort((a, b) => b - a)
        .forEach(score => remainingPlayers.push(...scoreGroups[score]));

    /* =======================
       APPARIEMENTS
    ======================= */
    const pairings = [];

    while (remainingPlayers.length > 1) {
        const p1 = remainingPlayers.shift();
        const p2 = remainingPlayers.shift();

        p1.opponents ??= [];
        p2.opponents ??= [];
        p1.adversaries ??= [];
        p2.adversaries ??= [];

        if (!p1.opponents.includes(p2.name)) p1.opponents.push(p2.name);
        if (!p2.opponents.includes(p1.name)) p2.opponents.push(p1.name);

        pairings.push([p1, p2]);
    }

    /* =======================
       BYE (plus petit score)
    ======================= */
    if (remainingPlayers.length === 1) {
        remainingPlayers.sort((a, b) => a.score - b.score);
        const byePlayer = remainingPlayers.shift();

        byePlayer.victory = (byePlayer.victory || 0) + 1;

        pairings.push([byePlayer, null]);
    }

    /* =======================
       AFFICHAGE
    ======================= */
    const container = document.getElementById("pairings");

    pairings.forEach((pair, index) => {
        const tr = document.createElement("tr");
        tr.className = "match-row";

        tr.innerHTML = `
            <td class="match-number">${index + 1}</td>
            <td class="player-name">${pair[0].name}</td>
        `;

        const tdButtons = document.createElement("td");

        if (pair[1]) {
            ["V", "DL", "V"].forEach(label => {
                const btn = document.createElement("button");
                btn.className = "select-btn";
                btn.textContent = label;

                btn.onclick = () => {
                    tdButtons.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
                    btn.classList.add("selected");
                    updateValidateButton();
                };

                tdButtons.appendChild(btn);
            });
        }

        const tdPlayer2 = document.createElement("td");
        tdPlayer2.className = "player-name";
        tdPlayer2.textContent = pair[1]
            ? pair[1].name
            : `${pair[0].name} est en bye (victoire d’office)`;

        tr.appendChild(tdButtons);
        tr.appendChild(tdPlayer2);
        container.appendChild(tr);
    });

    /* =======================
       VALIDATION DU ROUND
    ======================= */
    const validateBtn = document.getElementById("validate-round");

    function updateValidateButton() {
        const ok = [...document.querySelectorAll(".match-row")].every(row => {
            const btns = row.querySelectorAll(".select-btn");
            return btns.length === 0 || row.querySelector(".selected");
        });

        validateBtn.disabled = !ok;
        validateBtn.classList.toggle("enabled", ok);
    }

    validateBtn.addEventListener("click", () => {

        const matchRows = document.querySelectorAll(".match-row");

        matchRows.forEach(row => {
            const buttons = row.querySelectorAll(".select-btn");

            // Pas de boutons = bye (déjà géré avant)
            if (buttons.length === 0) return;

            const selected = row.querySelector(".selected");
            if (!selected) return;

            const label = selected.textContent;

            const leftName = row.children[1].textContent;
            const rightName = row.children[3].textContent;

            const leftPlayer = players.find(p => p.name === leftName);
            const rightPlayer = players.find(p => p.name === rightName);

            if (!leftPlayer || !rightPlayer) return;

            leftPlayer.victory ??= 0;
            leftPlayer.defeat ??= 0;
            leftPlayer.score ??= 0;

            rightPlayer.victory ??= 0;
            rightPlayer.defeat ??= 0;
            rightPlayer.score ??= 0;

            /* =======================
               CAS DE RÉSULTAT
            ======================= */
            if (label === "V" && selected === buttons[0]) {
                leftPlayer.victory += 1;
                rightPlayer.defeat += 1;

            } else if (label === "V" && selected === buttons[2]) {
                rightPlayer.victory += 1;
                leftPlayer.defeat += 1;

            } else if (label === "DL") {
                leftPlayer.defeat += 1;
                rightPlayer.defeat += 1;
            }

            /* =======================
               WINRATE
            ======================= */
            leftPlayer.winrate = Math.round(
                (leftPlayer.victory / (leftPlayer.victory + leftPlayer.defeat || 1)) * 100
            );
            rightPlayer.winrate = Math.round(
                (rightPlayer.victory / (rightPlayer.victory + rightPlayer.defeat || 1)) * 100
            );
        });

        players.forEach(player => {
            // Winrate moyen des opponents
            const opponentsWinrate = player.opponents?.length
                ? Math.round(player.opponents.map(name => {
                    const p = players.find(pl => pl.name === name);
                    return p ? p.winrate : 0;
                }).reduce((a,b)=>a+b,0) / player.opponents.length)
                : 0;

            // Construction du tableau adversaries
            player.adversaries = []; // on vide le tableau

            player.opponents?.forEach(opponentName => {
                const opponent = players.find(p => p.name === opponentName);
                if (!opponent) return;

                opponent.opponents?.forEach(advName => {
                    if (advName !== player.name) {
                        player.adversaries.push(advName);
                    }
                });
            });

            // Winrate moyen des adversaries
            const adversariesWinrate = player.adversaries?.length
                ? Math.round(player.adversaries.map(name => {
                    const p = players.find(pl => pl.name === name);
                    return p ? p.winrate : 0;
                }).reduce((a,b)=>a+b,0) / player.adversaries.length)
                : 0;

            // Score final
            let score = (player.victory || 0) * 3000000;
            score += opponentsWinrate * 1000;
            score += adversariesWinrate;

            // Format 9 chiffres
            player.score = String(score).padStart(9,'0');
        });

        /* =======================
           ROUND SUIVANT
        ======================= */
        let currentRound = parseInt(localStorage.getItem("currentRound")) || 1;
        localStorage.setItem("currentRound", currentRound + 1);

        localStorage.setItem("tournamentPlayers", JSON.stringify(players));

        window.location.href = "score.html";
    });

});
