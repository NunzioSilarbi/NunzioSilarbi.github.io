document.addEventListener("DOMContentLoaded", () => {

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

    let players = JSON.parse(localStorage.getItem("tournamentPlayers")) || [];

    if (!players.length) {
        alert("Aucun joueur trouvé !");
        window.location.href = "index.html";
        return;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    players.forEach(p => {
        p.opponents ??= [];
        p.adversaries ??= [];
        p.victory ??= 0;
        p.defeat ??= 0;
        p.score ??= "000000000";
    });

    shuffle(players);

    const groups = {};
    players.forEach(p => {
        const key = Math.floor(Number(p.score) / 1_000_000);
        groups[key] ??= [];
        groups[key].push(p);
    });

    Object.values(groups).forEach(shuffle);

    const orderedGroups = Object.keys(groups)
        .map(Number)
        .sort((a, b) => b - a);

    const pairings = [];
    let carryPlayer = null;

    orderedGroups.forEach(groupKey => {
        const group = groups[groupKey];

        if (carryPlayer) {
            group.unshift(carryPlayer);
            carryPlayer = null;
        }

        while (group.length >= 2) {
            const p1 = group.shift();
            let index = group.findIndex(p => !p1.opponents.includes(p.name));
            if (index === -1) index = 0;
            const p2 = group.splice(index, 1)[0];

            p1.opponents.push(p2.name);
            p2.opponents.push(p1.name);

            pairings.push([p1, p2]);
        }

        if (group.length === 1) carryPlayer = group.shift();
    });

    if (carryPlayer) {
        carryPlayer.victory += 1;
        pairings.push([carryPlayer, null]);
    }

    const container = document.getElementById("pairings");

    pairings.forEach((pair, idx) => {
        const tr = document.createElement("tr");
        tr.className = "match-row";

        tr.innerHTML = `
            <td class="match-number">${idx + 1}</td>
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

        document.querySelectorAll(".match-row").forEach(row => {
            const buttons = row.querySelectorAll(".select-btn");
            if (buttons.length === 0) return;

            const selected = row.querySelector(".selected");
            if (!selected) return;

            const label = selected.textContent;
            const leftName = row.children[1].textContent;
            const rightName = row.children[3].textContent;

            const left = players.find(p => p.name === leftName);
            const right = players.find(p => p.name === rightName);
            if (!left || !right) return;

            if (label === "V" && selected === buttons[0]) {
                left.victory += 1;
                right.defeat += 1;
            } else if (label === "V" && selected === buttons[2]) {
                right.victory += 1;
                left.defeat += 1;
            } else if (label === "DL") {
                left.defeat += 1;
                right.defeat += 1;
            }

            left.winrate = Math.round((left.victory / (left.victory + left.defeat || 1)) * 100);
            right.winrate = Math.round((right.victory / (right.victory + right.defeat || 1)) * 100);
        });

        players.forEach(player => {
            const opponentsWinrate = player.opponents?.length
                ? Math.round(player.opponents.map(n => players.find(p => p.name === n)?.winrate || 0).reduce((a,b)=>a+b,0) / player.opponents.length)
                : 0;

            player.adversaries = [];
            player.opponents?.forEach(opName => {
                const opp = players.find(p => p.name === opName);
                if (!opp) return;
                opp.opponents?.forEach(adv => { if (adv !== player.name) player.adversaries.push(adv); });
            });

            const adversariesWinrate = player.adversaries?.length
                ? Math.round(player.adversaries.map(n => players.find(p => p.name === n)?.winrate || 0).reduce((a,b)=>a+b,0) / player.adversaries.length)
                : 0;

            let score = player.victory * 3000000 + opponentsWinrate * 1000 + adversariesWinrate;
            player.score = String(score).padStart(9, '0');
        });

        localStorage.setItem("currentRound", (parseInt(localStorage.getItem("currentRound")) || 1) + 1);
        localStorage.setItem("tournamentPlayers", JSON.stringify(players));

        window.location.href = "score.html";
    });

});
