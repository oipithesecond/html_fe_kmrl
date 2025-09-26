const db = require('../database');
const { spawn } = require('child_process');
const path = require('path');

/**
 * Helper function to query all tables from the database.
 * This is used for the "Fetch Raw Data" button on the admin page.
 */
const queryAllTables = () => {
    const tables = {
        trainsets: 'trainsets',
        fitnessCertificates: 'fitness_certificates',
        jobCards: 'job_cards',
        slas: 'branding_slas',
        resources: 'depot_resources',
        layoutCosts: 'depot_layout_costs'
    };

    const promises = Object.entries(tables).map(([key, tableName]) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                if (err) return reject(err);
                resolve({ [key]: rows });
            });
        });
    });

    return Promise.all(promises).then(results => Object.assign({}, ...results));
};

/**
 * Controller for the "Fetch Raw Data" button.
 * Returns a JSON object of all data currently in the database.
 */
const getAllData = async (req, res) => {
    try {
        const allData = await queryAllTables();
        res.status(200).json(allData);
    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
};

/**
 * Controller for the "Run Model" button.
 * Executes the Python script, passing the database path directly.
 */
const runModel = async (req, res) => {
    const { w_mileage, w_branding } = req.body;
    if (!w_mileage || !w_branding) {
        return res.status(400).json({ error: "Mileage and Branding weights are required." });
    }

    // Define the path to the database file and the Python script
    const dbPath = path.join(__dirname, '..', '..', 'kochi-metro.db');
    const scriptPath = path.join(__dirname, '..', '..', 'model', 'solver2.py');

    try {
        // Execute the Python script, passing the DB path and weights as arguments
        const pythonProcess = spawn('python', [
            scriptPath,
            dbPath,
            w_mileage,
            w_branding
        ]);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorData}`);
                return res.status(500).json({ error: 'Model execution failed.', details: errorData });
            }
            
            try {
                // Parse the JSON output from the script and send it to the frontend
                const finalResult = JSON.parse(resultData);
                res.status(200).json(finalResult);
            } catch (e) {
                console.error('Failed to parse model output:', resultData);
                res.status(500).json({ error: 'Failed to parse model output.', details: resultData });
            }
        });

    } catch (error) {
        console.error("Error spawning the Python process:", error);
        res.status(500).json({ error: 'An error occurred before the model could run.' });
    }
};

const getTrainOverview = async (req, res) => {
    try {
        const query = (sql) => new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => (err ? reject(err) : resolve(rows)));
        });

        const [trains, certificates, jobCards, slas] = await Promise.all([
            query("SELECT * FROM trainsets ORDER BY trainset_id"),
            query("SELECT * FROM fitness_certificates"),
            query("SELECT * FROM job_cards"),
            query("SELECT * FROM branding_slas")
        ]);

        const overview = trains.map(train => {
            return {
                ...train,
                certificates: certificates.filter(c => c.trainset_id === train.trainset_id),
                jobCards: jobCards.filter(j => j.trainset_id === train.trainset_id),
                sla: slas.find(s => s.trainset_id === train.trainset_id) || null
            };
        });

        res.status(200).json({ data: overview });

    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
};

module.exports = { getAllData, runModel, getTrainOverview };