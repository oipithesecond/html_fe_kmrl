const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const DB_SOURCE = "kochi-metro.db";
const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the SQLite database for seeding.');
});

const seedFile = (filePath, tableName, columns) => {
    return new Promise((resolve, reject) => {
        const placeholders = columns.map(() => '?').join(',');
        const sql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;
        const stmt = db.prepare(sql);

        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Ensure boolean-like strings are handled if necessary
                if (row.is_critical) row.is_critical = String(row.is_critical).toLowerCase();
                if (row.has_branding_wrap) row.has_branding_wrap = String(row.has_branding_wrap).toLowerCase();
                rows.push(row);
            })
            .on('end', () => {
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION;');
                    rows.forEach(row => {
                        const values = columns.map(col => row[col]);
                        stmt.run(values, (err) => {
                            if (err) {
                                console.error(`Error inserting row into ${tableName}:`, row, err.message);
                            }
                        });
                    });
                    stmt.finalize();
                    db.run('COMMIT;', (err) => {
                        if (err) {
                            reject(new Error(`Transaction commit failed for ${tableName}: ${err.message}`));
                        } else {
                            console.log(`Successfully seeded ${rows.length} records into ${tableName}.`);
                            resolve();
                        }
                    });
                });
            })
            .on('error', (err) => {
                reject(new Error(`Error reading CSV file ${filePath}: ${err.message}`));
            });
    });
};

const runSeeder = async () => {
    try {
        await seedFile(
            path.join(__dirname, 'data', 'trainsets_master.csv'),
            'trainsets',
            ['trainset_id', 'cumulative_mileage_km', 'in_service_date', 'has_branding_wrap']
        );
        await seedFile(
            path.join(__dirname, 'data', 'fitness_certificates.csv'),
            'fitness_certificates',
            ['certificate_id', 'trainset_id', 'certificate_type', 'expiry_date']
        );
        await seedFile(
            path.join(__dirname, 'data', 'job_cards_maximo.csv'),
            'job_cards',
            ['job_card_id', 'trainset_id', 'status', 'is_critical', 'description', 'required_man_hours']
        );
        await seedFile(
            path.join(__dirname, 'data', 'branding_slas.csv'),
            'branding_slas',
            ['sla_id', 'trainset_id', 'target_exposure_hours', 'current_exposure_hours', 'penalty_per_hour']
        );
        await seedFile(
            path.join(__dirname, 'data', 'depot_resources.csv'),
            'depot_resources',
            ['resource_id', 'available_capacity']
        );
        await seedFile(
            path.join(__dirname, 'data', 'depot_layout_costs.csv'),
            'depot_layout_costs',
            ['from_location', 'to_location', 'shunting_cost']
        );
    } catch (error) {
        console.error('Seeding process failed:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Database connection closed.');
        });
    }
};

runSeeder();