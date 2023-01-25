const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid text UNIQUE,
            num_players INTEGER,
            player_1_areas TEXT,
            player_2_areas TEXT,
            player_3_areas TEXT,
            player_4_areas TEXT,
            CONSTRAINT uuid_unique UNIQUE (uuid)
            )`);
    }
});


module.exports = db