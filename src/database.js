const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = "kochi-metro.db";

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS branding_slas (
                sla_id TEXT PRIMARY KEY, trainset_id TEXT, target_exposure_hours INTEGER,
                current_exposure_hours INTEGER, penalty_per_hour INTEGER
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS depot_layout_costs (
                id INTEGER PRIMARY KEY AUTOINCREMENT, from_location TEXT, to_location TEXT, shunting_cost INTEGER
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS depot_resources (
                resource_id TEXT PRIMARY KEY, available_capacity INTEGER
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS fitness_certificates (
                certificate_id TEXT PRIMARY KEY, trainset_id TEXT, certificate_type TEXT, expiry_date TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS job_cards (
                job_card_id TEXT PRIMARY KEY, trainset_id TEXT, status TEXT, 
                is_critical TEXT, description TEXT, required_man_hours INTEGER
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS trainsets (
                trainset_id TEXT PRIMARY KEY, cumulative_mileage_km INTEGER, in_service_date TEXT, has_branding_wrap TEXT
            )`);
        });
    }
});

module.exports = db;