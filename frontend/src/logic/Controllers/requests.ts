export async function saveGame(numPlayers: number, playerAreas: Array<string>, playerName: string) {
    const players = formatPlayerData(playerAreas, playerName);

    try {
        const body = {
            numPlayers: numPlayers,
            players: players
        }

        return fetch('http://localhost:8000/api/game', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    } catch (err) {
        console.error(err);
        return;
    }
}

function formatPlayerData(playerAreas: Array<string>, playerName: string): Array<{ name: string, areas: string }> {
    const players = [];

    const firstPlayer = {
        name: playerName,
        areas: playerAreas[0]
    }
    players.push(firstPlayer);

    for (let i = 1; i < playerAreas.length; i++) {
        const player = { name: '', areas: playerAreas[i] };
        players.push(player)
    }

    return players;
}

export async function getGame(gameUuid: string) {
    try {
        return fetch(`http://localhost:8000/api/game/${gameUuid}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
    } catch (err) {
        console.error(err);
        return;
    }
}